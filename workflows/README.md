# ComfyUI Workflow for BordadoBot Style Transfer (LoRA Method)

This directory contains the API-compatible workflow JSON for integrating BordadoBot with a local ComfyUI instance using a base model and a custom LoRA.

## Workflow File
- `comfy_style_transfer_api.json`: The prompt configuration sent to the ComfyUI API (`/prompt` endpoint).

## Setup Instructions

### 1. Place your models
Move your models into the respective local ComfyUI folders:

1. **Base SDXL Checkpoint** (e.g., `sd_xl_base_1.0.safetensors`):
   ```
   ComfyUI/models/checkpoints/
   ```
2. **Custom Trained LoRA** (your dataset `.safetensors` file):
   ```
   ComfyUI/models/loras/
   ```

### 2. Run ComfyUI
Start ComfyUI on your local machine. By default, it runs on:
`http://127.0.0.1:8188`

### 3. (Optional) Load/Edit the Workflow in ComfyUI
If you want to view or tweak the workflow in the ComfyUI browser interface:
1. Open ComfyUI in your browser (`http://127.0.0.1:8188`).
2. Click **Load** and select `comfy_style_transfer_api.json`.
3. If you make modifications and want to export it back for the API, make sure **Dev Mode** is enabled:
   - Click the **Gear icon (Settings)** in ComfyUI.
   - Toggle **Enable Dev mode** to on.
   - Now, a new button **Save (API Format)** will appear in the ComfyUI control panel. Use that button to export the JSON, as the standard "Save" button includes visual UI elements not parsed by the API.

## Customizing parameters in the App
BordadoBot's UI allows you to dynamically configure:
- **Server Address**: `http://127.0.0.1:8188` (or custom address/port).
- **Base Checkpoint**: Pick from available checkpoints or type the filename directly.
- **LoRA Model**: Pick from available LoRAs or type the filename directly.
- **LoRA Strength**: Controls how strongly the style is applied (range `0.0` to `2.0`, default `1.0`).
- **Denoising Strength**: Controls image composition vs style transfer (lower preserves layout, higher adds more style texture).
- **CFG Scale**: Controls prompt adherence.
- **Steps**: Sampling steps.
- **Positive/Negative Prompts**: Customize keywords for embroidery.
