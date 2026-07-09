import { useState, useEffect } from "react";
import { Upload, Sparkles, Download, X, RefreshCw, Settings, ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Slider } from "../components/ui/slider";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  checkComfyConnection,
  fetchComfyModels,
  uploadImageToComfy,
  submitComfyPrompt,
  monitorComfyProgress,
  resizeImage,
  type ComfyProgress,
} from "../services/comfyService";
import comfyWorkflowTemplate from "../../../workflows/comfy_style_transfer_api.json";

export default function Create() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  // ComfyUI-specific states
  const [comfyUrl, setComfyUrl] = useState<string>(() => {
    const saved = localStorage.getItem("comfy_url");
    if (!saved || saved === "http://127.0.0.1:8188") {
      return "/api/comfy";
    }
    return saved;
  });
  const [baseCheckpoint, setBaseCheckpoint] = useState<string>(() => {
    return localStorage.getItem("comfy_base_checkpoint") || "sd_xl_base_1.0.safetensors";
  });
  const [loraModel, setLoraModel] = useState<string>(() => {
    return localStorage.getItem("comfy_lora_model") || "embroidery_sdxl_lora.safetensors";
  });
  const [loraStrength, setLoraStrength] = useState<number>(() => {
    const saved = localStorage.getItem("comfy_lora_strength");
    return saved !== null ? parseFloat(saved) : 1.0;
  });
  const [positivePrompt, setPositivePrompt] = useState<string>(() => {
    return localStorage.getItem("comfy_positive_prompt") || "embroidery style, castelo branco style embroidery, embroidery pattern, detailed stitching, colorful thread, fabric texture";
  });
  const [negativePrompt, setNegativePrompt] = useState<string>(() => {
    return localStorage.getItem("comfy_negative_prompt") || "blurry, low quality, photorealistic, photo, 3d render, frame, background fabric, out of focus, duplicate, watermark, signature";
  });
  const [denoise, setDenoise] = useState<number>(() => {
    const saved = localStorage.getItem("comfy_denoise");
    return saved !== null ? parseFloat(saved) : 0.55;
  });
  const [cfg, setCfg] = useState<number>(() => {
    const saved = localStorage.getItem("comfy_cfg");
    return saved !== null ? parseFloat(saved) : 7.0;
  });
  const [steps, setSteps] = useState<number>(() => {
    const saved = localStorage.getItem("comfy_steps");
    return saved !== null ? parseInt(saved, 10) : 20;
  });

  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("disconnected");
  const [availableCheckpoints, setAvailableCheckpoints] = useState<string[]>([]);
  const [availableLoras, setAvailableLoras] = useState<string[]>([]);
  const [comfyProgress, setComfyProgress] = useState<ComfyProgress | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("comfy_url", comfyUrl);
    localStorage.setItem("comfy_base_checkpoint", baseCheckpoint);
    localStorage.setItem("comfy_lora_model", loraModel);
    localStorage.setItem("comfy_lora_strength", String(loraStrength));
    localStorage.setItem("comfy_positive_prompt", positivePrompt);
    localStorage.setItem("comfy_negative_prompt", negativePrompt);
    localStorage.setItem("comfy_denoise", String(denoise));
    localStorage.setItem("comfy_cfg", String(cfg));
    localStorage.setItem("comfy_steps", String(steps));
  }, [comfyUrl, baseCheckpoint, loraModel, loraStrength, positivePrompt, negativePrompt, denoise, cfg, steps]);

  const checkConnection = async () => {
    setConnectionStatus("checking");
    const connected = await checkComfyConnection(comfyUrl);
    if (connected) {
      setConnectionStatus("connected");
      const models = await fetchComfyModels(comfyUrl);
      setAvailableCheckpoints(models.checkpoints);
      setAvailableLoras(models.loras);

      // Auto-select defaults from server if ours are not there
      if (models.checkpoints.length > 0 && !models.checkpoints.includes(baseCheckpoint)) {
        const match = models.checkpoints.find(c => c.toLowerCase().includes("sd_xl") || c.toLowerCase().includes("sdxl"));
        setBaseCheckpoint(match || models.checkpoints[0]);
      }
      if (models.loras.length > 0 && !models.loras.includes(loraModel)) {
        const match = models.loras.find(l => l.toLowerCase().includes("embroidery") || l.toLowerCase().includes("lora"));
        setLoraModel(match || models.loras[0]);
      }
    } else {
      setConnectionStatus("disconnected");
    }
  };

  useEffect(() => {
    checkConnection();
  }, [comfyUrl]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (only PNG and JPEG/JPG)
      const allowedTypes = ["image/png", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Only .png and .jpeg files are accepted. Please select a compatible image.",
          duration: 8000,
          style: {
            padding: "16px"
          },
          action: {
            label: "Dismiss",
            onClick: () => { },
          },
        });
        return;
      }

      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File is too large", {
          description: `The file you selected is ${(file.size / (1024 * 1024)).toFixed(1)}MB. The maximum size allowed is 100MB.`,
          duration: 10000,
          style: {
            padding: "16px"
          },
          action: {
            label: "Dismiss",
            onClick: () => { },
          },
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setResultImage(null);
        setComfyProgress(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransform = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);

    try {
      setComfyProgress({
        status: "connecting",
        message: "Checking connection to local ComfyUI...",
      });

      const connected = await checkComfyConnection(comfyUrl);
      if (!connected) {
        throw new Error("Unable to connect to ComfyUI. Please ensure ComfyUI is running locally.");
      }

      const clientId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      setComfyProgress({
        status: "uploading",
        message: "Optimizing image resolution for SDXL...",
      });
      const resizedImage = await resizeImage(selectedImage, 1024);

      setComfyProgress({
        status: "uploading",
        message: "Uploading optimized image...",
      });
      const comfyImageName = await uploadImageToComfy(comfyUrl, resizedImage);

      // Prepare prompt payload
      const workflow = JSON.parse(JSON.stringify(comfyWorkflowTemplate));
      workflow["3"].inputs.ckpt_name = baseCheckpoint;
      workflow["2"].inputs.lora_name = loraModel;
      workflow["2"].inputs.strength_model = loraStrength;
      workflow["2"].inputs.strength_clip = loraStrength;

      const fullPositivePrompt = description.trim()
        ? `${positivePrompt}, ${description.trim()}`
        : positivePrompt;
      workflow["4"].inputs.text = fullPositivePrompt;
      workflow["5"].inputs.text = negativePrompt;
      workflow["10"].inputs.image = comfyImageName;

      workflow["12"].inputs.denoise = denoise;
      workflow["12"].inputs.cfg = cfg;
      workflow["12"].inputs.steps = steps;
      workflow["12"].inputs.seed = Math.floor(Math.random() * 1000000000000000);

      setComfyProgress({
        status: "queueing",
        message: "Submitting generation prompt...",
      });
      const promptId = await submitComfyPrompt(comfyUrl, clientId, workflow);

      const finalUrl = await monitorComfyProgress(comfyUrl, clientId, promptId, (progress) => {
        setComfyProgress(progress);
      });

      setResultImage(finalUrl);

      // Save to gallery
      const newImageItem = {
        id: Math.random().toString(36).substring(2, 15),
        url: finalUrl,
        title: description.trim() ? `${description.trim()} Embroidery` : "Embroidery Artwork",
        createdAt: new Date().toISOString().split("T")[0],
      };
      const existingGallery = JSON.parse(localStorage.getItem("bordadobot_gallery") || "[]");
      localStorage.setItem("bordadobot_gallery", JSON.stringify([newImageItem, ...existingGallery]));

      toast.success("Embroidery pattern generated!");
    } catch (err) {
      console.error(err);
      setComfyProgress({
        status: "error",
        message: (err as Error).message || "Generation failed",
      });
      toast.error((err as Error).message || "Failed to generate embroidery pattern.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    try {
      const link = document.createElement("a");
      link.href = resultImage;
      link.download = "embroidery-artwork.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Artwork downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download artwork.");
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setDescription("");
    setResultImage(null);
    setComfyProgress(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-accent/20 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="mb-3">Create Your Embroidery</h1>
            <p className="font-secondary text-xl text-muted-foreground italic">
              Upload your image and transform it into stunning embroidery art
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-8 bg-card/80 backdrop-blur-sm border-primary/20">
                <div className="flex items-center justify-between mb-6">
                  <h2>Original Image</h2>
                  {selectedImage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </Button>
                  )}
                </div>

                {!selectedImage ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-2xl cursor-pointer hover:border-primary/60 hover:bg-accent/20 transition-all duration-300 min-h-[400px] group">
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <p className="font-sans text-center px-4 mb-2">
                      Click to upload an image
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                  </label>
                ) : (
                  <div className="space-y-6">
                    <div className="relative rounded-2xl overflow-hidden border border-primary/20">
                      <img
                        src={selectedImage}
                        alt="Uploaded"
                        className="w-full h-auto object-contain max-h-[400px]"
                      />
                    </div>

                    {/* Simple Description Input */}
                    <div className="space-y-1.5">
                      <label htmlFor="user-prompt" className="block text-sm font-semibold text-foreground font-sans">
                        What would you like to embroider?
                      </label>
                      <Textarea
                        id="user-prompt"
                        placeholder="e.g. a red flower, a custom bird pattern, or leave blank to style the image directly..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="resize-none text-sm"
                        rows={3}
                      />
                    </div>

                    {/* Advanced Settings Expandable Header */}
                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="w-full flex items-center justify-between text-muted-foreground hover:text-foreground font-sans px-4 py-2.5 bg-muted/20 border border-primary/10 rounded-lg hover:bg-muted/40"
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <Settings className={`w-4 h-4 transition-transform duration-500 ${showAdvanced ? "rotate-90" : ""}`} />
                          Advanced ComfyUI Settings
                        </span>
                        <motion.div
                          animate={{ rotate: showAdvanced ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </Button>
                    </div>

                    {/* Collapsible Settings Panel */}
                    <motion.div
                      initial={false}
                      animate={{ height: showAdvanced ? "auto" : 0, opacity: showAdvanced ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 pb-2 space-y-4 border-t border-primary/10 mt-2">
                        <Tabs defaultValue="basic" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 bg-muted/40">
                            <TabsTrigger value="basic" className="text-xs">Basic Settings</TabsTrigger>
                            <TabsTrigger value="prompt" className="text-xs">Style Details</TabsTrigger>
                          </TabsList>

                          <TabsContent value="basic" className="space-y-4 pt-4">
                            {/* Connection Badge */}
                            <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg border border-primary/10">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${connectionStatus === "connected" ? "bg-green-500 shadow-[0_0_8px_#22c55e]" :
                                  connectionStatus === "checking" ? "bg-amber-500 animate-pulse" : "bg-red-500"
                                  }`} />
                                <span className="text-xs font-sans font-medium text-foreground">
                                  {connectionStatus === "connected" ? "ComfyUI Connected" :
                                    connectionStatus === "checking" ? "Connecting to ComfyUI..." : "ComfyUI Disconnected"}
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={checkConnection}
                                className="h-8 text-xs font-sans px-3 gap-1 hover:bg-accent/40"
                                disabled={connectionStatus === "checking"}
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus === "checking" ? "animate-spin" : ""}`} />
                                Test
                              </Button>
                            </div>

                            {/* Server URL */}
                            <div className="space-y-1.5">
                              <Label htmlFor="comfy-url" className="text-xs font-semibold">ComfyUI Server Address</Label>
                              <Input
                                id="comfy-url"
                                value={comfyUrl}
                                onChange={(e) => setComfyUrl(e.target.value)}
                                placeholder="/api/comfy"
                                className="h-9 text-xs"
                              />
                              <p className="text-[10px] text-muted-foreground leading-normal font-sans">
                                Use <code className="bg-muted px-1 py-0.5 rounded font-mono">/api/comfy</code> (recommended) to route requests via the Vite proxy and avoid browser CORS blocks.
                              </p>
                            </div>

                            {/* Checkpoint Selection */}
                            <div className="space-y-1.5">
                              <Label htmlFor="base-checkpoint" className="text-xs font-semibold">Base Checkpoint (SDXL)</Label>
                              {availableCheckpoints.length > 0 ? (
                                <Select value={baseCheckpoint} onValueChange={setBaseCheckpoint}>
                                  <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Select checkpoint" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableCheckpoints.map((ckpt) => (
                                      <SelectItem key={ckpt} value={ckpt} className="text-xs">
                                        {ckpt}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  id="base-checkpoint"
                                  value={baseCheckpoint}
                                  onChange={(e) => setBaseCheckpoint(e.target.value)}
                                  placeholder="sd_xl_base_1.0.safetensors"
                                  className="h-9 text-xs"
                                />
                              )}
                            </div>

                            {/* LoRA Model */}
                            <div className="space-y-1.5">
                              <Label htmlFor="lora-model" className="text-xs font-semibold">LoRA Model</Label>
                              {availableLoras.length > 0 ? (
                                <Select value={loraModel} onValueChange={setLoraModel}>
                                  <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Select LoRA model" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableLoras.map((lor) => (
                                      <SelectItem key={lor} value={lor} className="text-xs">
                                        {lor}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  id="lora-model"
                                  value={loraModel}
                                  onChange={(e) => setLoraModel(e.target.value)}
                                  placeholder="embroidery_sdxl_lora.safetensors"
                                  className="h-9 text-xs"
                                />
                              )}
                            </div>

                            {/* LoRA Strength Slider */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs font-semibold">
                                <Label>LoRA Strength</Label>
                                <span className="text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{loraStrength.toFixed(2)}</span>
                              </div>
                              <Slider
                                value={[loraStrength]}
                                onValueChange={(vals) => setLoraStrength(vals[0])}
                                min={0.0}
                                max={2.0}
                                step={0.05}
                                className="py-2"
                              />
                            </div>

                            {/* Denoising Slider */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs font-semibold">
                                <Label>Denoising Strength (Style vs Structure)</Label>
                                <span className="text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{denoise.toFixed(2)}</span>
                              </div>
                              <Slider
                                value={[denoise]}
                                onValueChange={(vals) => setDenoise(vals[0])}
                                min={0.1}
                                max={1.0}
                                step={0.05}
                                className="py-2"
                              />
                              <p className="text-[10px] text-muted-foreground leading-normal font-sans">
                                Lower = keeps original layout shapes. Higher = transforms structure more toward embroidery style.
                              </p>
                            </div>
                          </TabsContent>

                          <TabsContent value="prompt" className="space-y-4 pt-4">
                            {/* Positive Prompt */}
                            <div className="space-y-1.5">
                              <Label htmlFor="positive-prompt" className="text-xs font-semibold">Base Positive Prompt (Embroidery Style)</Label>
                              <Textarea
                                id="positive-prompt"
                                value={positivePrompt}
                                onChange={(e) => setPositivePrompt(e.target.value)}
                                placeholder="embroidery style..."
                                className="resize-none text-xs"
                                rows={3}
                              />
                            </div>

                            {/* Negative Prompt */}
                            <div className="space-y-1.5">
                              <Label htmlFor="negative-prompt" className="text-xs font-semibold">Negative Prompt</Label>
                              <Textarea
                                id="negative-prompt"
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                                placeholder="blurry, low quality..."
                                className="resize-none text-xs"
                                rows={2}
                              />
                            </div>

                            {/* Steps and CFG */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs font-semibold">
                                  <Label>Steps</Label>
                                  <span className="text-muted-foreground font-mono bg-muted px-1.5 rounded">{steps}</span>
                                </div>
                                <Slider
                                  value={[steps]}
                                  onValueChange={(vals) => setSteps(vals[0])}
                                  min={10}
                                  max={50}
                                  step={1}
                                  className="py-2"
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs font-semibold">
                                  <Label>CFG Scale</Label>
                                  <span className="text-muted-foreground font-mono bg-muted px-1.5 rounded">{cfg.toFixed(1)}</span>
                                </div>
                                <Slider
                                  value={[cfg]}
                                  onValueChange={(vals) => setCfg(vals[0])}
                                  min={1.0}
                                  max={15.0}
                                  step={0.5}
                                  className="py-2"
                                />
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </motion.div>

                    <Button
                      onClick={handleTransform}
                      disabled={isProcessing}
                      className="w-full gap-2"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Sparkles className="w-5 h-5" />
                          </motion.div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Transform to Embroidery
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Result Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-8 bg-card/80 backdrop-blur-sm border-primary/20">
                <h2 className="mb-6">Embroidery Result</h2>

                <div className="flex items-center justify-center border-2 border-primary/30 rounded-2xl min-h-[400px] bg-accent/10">
                  {isProcessing ? (
                    <div className="text-center px-6 w-full max-w-md">
                      {comfyProgress ? (
                        <div className="space-y-6">
                          <motion.div
                            animate={{ rotate: comfyProgress.status === "running" ? 360 : 0 }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto"
                          >
                            <Sparkles className="w-10 h-10 text-primary" />
                          </motion.div>

                          <div className="space-y-2">
                            <p className="font-sans font-semibold text-foreground capitalize">
                              {comfyProgress.status === "running" ? "Generating Pattern" : comfyProgress.status}
                            </p>
                            <p className="font-secondary text-muted-foreground text-sm italic">
                              {comfyProgress.message}
                            </p>
                          </div>

                          {comfyProgress.status === "running" && comfyProgress.step !== undefined && comfyProgress.maxSteps !== undefined && (
                            <div className="space-y-2">
                              <Progress
                                value={(comfyProgress.step / comfyProgress.maxSteps) * 100}
                                className="h-2 w-full"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground font-sans">
                                <span>Step {comfyProgress.step} of {comfyProgress.maxSteps}</span>
                                <span>{Math.round((comfyProgress.step / comfyProgress.maxSteps) * 100)}%</span>
                              </div>
                            </div>
                          )}

                          {comfyProgress.status !== "running" && comfyProgress.status !== "done" && comfyProgress.status !== "error" && (
                            <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden relative">
                              <motion.div
                                className="bg-primary h-full rounded-full w-1/3"
                                animate={{ x: ["-100%", "300%"] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6"
                          >
                            <Sparkles className="w-10 h-10 text-primary" />
                          </motion.div>
                          <p className="font-secondary text-muted-foreground italic animate-pulse">
                            Generating embroidery pattern...
                          </p>
                        </>
                      )}
                    </div>
                  ) : resultImage ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="w-full"
                    >
                      <img
                        src={resultImage}
                        alt="Embroidery result"
                        className="w-full h-auto object-contain max-h-[400px] rounded-xl mx-auto"
                      />
                    </motion.div>
                  ) : (
                    <div className="text-center px-4">
                      <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-10 h-10 text-primary" />
                      </div>
                      <p className="font-secondary text-muted-foreground italic">
                        Your embroidery artwork will appear here
                      </p>
                    </div>
                  )}
                </div>

                {resultImage && (
                  <div className="flex gap-3 mt-6">
                    <Button className="w-full gap-2" size="lg" onClick={handleDownload}>
                      <Download className="w-5 h-5" />
                      Download
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {!selectedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8"
            >
              <Card className="p-6 bg-muted/50 border-primary/10">
                <p className="text-sm text-muted-foreground text-center font-sans">
                  <strong>Note:</strong> Neural style transfer runs locally using ComfyUI. Adjust your local models and settings in the Advanced section above.
                </p>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}