import { useState } from "react";
import { Upload, Sparkles, Download, Share2, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { motion } from "motion/react";
import { toast } from "sonner";

export default function Create() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransform = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);

    try {
      // Mock processing - in production this would call Supabase edge function
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResultImage(selectedImage); // Placeholder result
      toast.success("Embroidery pattern generated!");
    } catch (err) {
      toast.error("Failed to generate embroidery pattern.");
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

  const handleShare = async () => {
    if (!resultImage) return;
    const shareData = {
      title: "My Embroidery Artwork",
      text: "Check out this beautiful Castelo Branco style embroidery I created with BordadoBot!",
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Failed to share.");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link.");
      }
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setDescription("");
    setResultImage(null);
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

                    <div>
                      <label className="block mb-2 font-sans">
                        Description (optional)
                      </label>
                      <Textarea
                        placeholder="Add context to help the AI understand your image..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="resize-none"
                        rows={4}
                      />
                    </div>

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
                    <div className="text-center px-4">
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
                        className="w-full h-auto object-contain max-h-[400px] rounded-xl"
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
                    <Button className="flex-1 gap-2" size="lg" onClick={handleDownload}>
                      <Download className="w-5 h-5" />
                      Download
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2" size="lg" onClick={handleShare}>
                      <Share2 className="w-5 h-5" />
                      Share
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
                  <strong>Note:</strong> Neural style transfer requires Supabase
                  connection. Currently showing UI demonstration only. Connect
                  Supabase in settings to enable AI transformation.
                </p>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}