/**
 * Helper to convert a data URL (base64) to a Blob.
 */
export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Helper to get the correct API base URL.
 * If serverUrl is relative (e.g. /api/comfy), resolves it against window.location.origin.
 */
function getApiUrl(serverUrl: string): string {
  const cleanUrl = serverUrl.replace(/\/$/, "");
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }
  // Fallback / support relative proxy path
  return `${window.location.origin}${cleanUrl}`;
}

/**
 * Checks if the ComfyUI server is reachable.
 */
export async function checkComfyConnection(serverUrl: string): Promise<boolean> {
  try {
    const baseUrl = getApiUrl(serverUrl);
    const response = await fetch(`${baseUrl}/system_stats`, {
      method: "GET",
      // Short timeout to avoid hanging UI
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}

/**
 * Fetches available checkpoints and LoRAs from the ComfyUI server.
 */
export async function fetchComfyModels(serverUrl: string): Promise<{
  checkpoints: string[];
  loras: string[];
}> {
  const baseUrl = getApiUrl(serverUrl);
  const results = { checkpoints: [] as string[], loras: [] as string[] };

  try {
    const ckptRes = await fetch(`${baseUrl}/object_info/CheckpointLoaderSimple`, {
      signal: AbortSignal.timeout(3000),
    });
    if (ckptRes.ok) {
      const data = await ckptRes.json();
      results.checkpoints = data.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0] || [];
    }
  } catch (e) {
    console.error("Failed to fetch checkpoints:", e);
  }

  try {
    const loraRes = await fetch(`${baseUrl}/object_info/LoraLoader`, {
      signal: AbortSignal.timeout(3000),
    });
    if (loraRes.ok) {
      const data = await loraRes.json();
      results.loras = data.LoraLoader?.input?.required?.lora_name?.[0] || [];
    }
  } catch (e) {
    console.error("Failed to fetch LoRAs:", e);
  }

  return results;
}

/**
 * Uploads an image (as base64 string) to ComfyUI.
 * Returns the unique filename assigned by ComfyUI.
 */
export async function uploadImageToComfy(
  serverUrl: string,
  base64Image: string
): Promise<string> {
  const baseUrl = getApiUrl(serverUrl);
  const blob = dataURLtoBlob(base64Image);
  const formData = new FormData();
  formData.append("image", blob, "bordadobot_input.png");
  formData.append("overwrite", "true");

  const response = await fetch(`${baseUrl}/upload/image`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`);
  }

  const result = await response.json();
  return result.name;
}

/**
 * Submits the prompt workflow JSON to ComfyUI.
 * Returns the unique prompt ID.
 */
export async function submitComfyPrompt(
  serverUrl: string,
  clientId: string,
  promptWorkflow: Record<string, any>
): Promise<string> {
  const baseUrl = getApiUrl(serverUrl);
  const response = await fetch(`${baseUrl}/prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      prompt: promptWorkflow,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to submit prompt: ${errText || response.statusText}`);
  }

  const result = await response.json();
  if (result.node_errors && Object.keys(result.node_errors).length > 0) {
    throw new Error(`Workflow validation errors: ${JSON.stringify(result.node_errors)}`);
  }

  return result.prompt_id;
}

/**
 * Custom type representing the progress state of the generation.
 */
export interface ComfyProgress {
  status: "idle" | "connecting" | "uploading" | "queueing" | "running" | "decoding" | "done" | "error";
  message: string;
  step?: number;
  maxSteps?: number;
  nodeTitle?: string;
  imageUrl?: string;
}

/**
 * Monitors the WebSocket for progress and output.
 * Calls callback on each progress update and resolves with the final image URL when done.
 */
export function monitorComfyProgress(
  serverUrl: string,
  clientId: string,
  promptId: string,
  onProgress: (progress: ComfyProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const cleanUrl = serverUrl.replace(/\/$/, "");
    const baseUrl = getApiUrl(serverUrl);
    
    let wsUrl: string;
    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
      wsUrl = cleanUrl.replace(/^http/, "ws") + `/ws?clientId=${clientId}`;
    } else {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      wsUrl = `${protocol}//${window.location.host}${cleanUrl}/ws?clientId=${clientId}`;
    }
    
    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
    } catch (e) {
      reject(new Error(`Failed to establish WebSocket connection to ${wsUrl}`));
      return;
    }

    // Auto-timeout if the server hangs completely (5 minutes)
    const timeoutId = setTimeout(() => {
      ws.close();
      reject(new Error("Generation timed out. Check ComfyUI logs."));
    }, 300000);

    ws.onopen = () => {
      onProgress({
        status: "queueing",
        message: "Prompt queued. Waiting for execution...",
      });
    };

    ws.onerror = (e) => {
      clearTimeout(timeoutId);
      reject(new Error("WebSocket error. Connection lost."));
    };

    ws.onclose = () => {
      clearTimeout(timeoutId);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // progress message
        if (msg.type === "progress" && msg.data.prompt_id === promptId) {
          const { value, max } = msg.data;
          onProgress({
            status: "running",
            message: `Processing steps...`,
            step: value,
            maxSteps: max,
            nodeTitle: "KSampler",
          });
        }

        // executing node message
        if (msg.type === "executing" && msg.data.prompt_id === promptId) {
          const node = msg.data.node;
          if (node === null) {
            // Null node means execution completed
            onProgress({
              status: "decoding",
              message: "Decoding image and finalizing...",
            });
          } else {
            onProgress({
              status: "running",
              message: `Executing node ${node}...`,
            });
          }
        }

        // executed node (output received)
        if (msg.type === "executed" && msg.data.prompt_id === promptId) {
          const output = msg.data.output;
          if (output && output.images && output.images.length > 0) {
            clearTimeout(timeoutId);
            ws.close();

            const img = output.images[0];
            const finalImageUrl = `${baseUrl}/view?filename=${encodeURIComponent(img.filename)}&subfolder=${encodeURIComponent(img.subfolder)}&type=${encodeURIComponent(img.type)}`;
            
            onProgress({
              status: "done",
              message: "Artwork generated successfully!",
              imageUrl: finalImageUrl,
            });

            resolve(finalImageUrl);
          }
        }
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
      }
    };
  });
}

/**
 * Resizes a base64 image data URL so that its longest side is at most maxDimension.
 * Maintains the aspect ratio of the original image.
 */
export function resizeImage(base64Str: string, maxDimension = 1024): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width <= maxDimension && height <= maxDimension) {
        resolve(base64Str);
        return;
      }

      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}
