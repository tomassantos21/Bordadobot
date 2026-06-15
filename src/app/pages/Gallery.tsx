import { useState } from "react";
import { Download, Trash2, Calendar } from "lucide-react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { Link } from "react-router";

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  createdAt: string;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>(() => {
    const saved = localStorage.getItem("bordadobot_gallery");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse gallery from localStorage", e);
      }
    }
    return [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1452457807411-4979b707c5be?w=800&h=600&fit=crop",
        title: "Mountain Landscape Embroidery",
        createdAt: "2026-04-05",
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=1000&fit=crop",
        title: "Forest Path Embroidery",
        createdAt: "2026-04-04",
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=500&fit=crop",
        title: "Sunset Vista Embroidery",
        createdAt: "2026-04-03",
      },
      {
        id: "4",
        url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=900&fit=crop",
        title: "Alpine Meadow Embroidery",
        createdAt: "2026-04-02",
      },
      {
        id: "5",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        title: "Mountain Peak Embroidery",
        createdAt: "2026-04-01",
      },
      {
        id: "6",
        url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=800&fit=crop",
        title: "Lake Reflection Embroidery",
        createdAt: "2026-03-31",
      },
    ];
  });

  const handleDelete = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    setImages(updated);
    localStorage.setItem("bordadobot_gallery", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-accent/20 py-8 sm:py-16">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 px-2">
            <h1 className="mb-3">My Gallery</h1>
            <p className="font-secondary text-base sm:text-xl text-muted-foreground italic">
              Your collection of embroidery transformations
            </p>
          </div>

          {images.length === 0 ? (
            <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-primary" />
                </div>
                <h2 className="mb-3">No creations yet</h2>
                <p className="font-sans text-muted-foreground mb-6">
                  Start creating beautiful embroidery art from your photos
                </p>
                <Button asChild>
                  <Link to="/create">Create Your First Embroidery</Link>
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* Mobile: full-width scrollable list */}
              <div className="flex flex-col gap-5 sm:hidden">
                {images.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden border-primary/20 bg-card/80 backdrop-blur-sm">
                      <div className="relative">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="mb-2">{image.title}</h3>
                        <div className="flex items-center justify-between">
                          <p className="text-muted-foreground text-sm font-sans flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(image.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2">
                            <Button size="icon" variant="secondary" className="rounded-full h-10 w-10" asChild>
                              <a href={image.url} download target="_blank" rel="noopener noreferrer" title="Download image">
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              className="rounded-full h-10 w-10"
                              onClick={() => handleDelete(image.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Tablet/Desktop: responsive masonry */}
              <div className="hidden sm:block">
                <ResponsiveMasonry columnsCountBreakPoints={{ 640: 2, 1024: 3 }}>
                  <Masonry gutter="1.5rem">
                    {images.map((image, index) => (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="group overflow-hidden border-primary/20 hover:border-primary/40 transition-all duration-300 bg-card/80 backdrop-blur-sm">
                          <div className="relative overflow-hidden">
                            <img
                              src={image.url}
                              alt={image.title}
                              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="text-white mb-2">{image.title}</h3>
                                <div className="flex items-center justify-between">
                                  <p className="text-white/80 text-sm font-sans flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(image.createdAt).toLocaleDateString()}
                                  </p>
                                  <div className="flex gap-2">
                                    <Button size="icon" variant="secondary" className="rounded-full h-9 w-9" asChild>
                                      <a href={image.url} download target="_blank" rel="noopener noreferrer" title="Download image">
                                        <Download className="w-4 h-4" />
                                      </a>
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="destructive"
                                      className="rounded-full h-9 w-9"
                                      onClick={() => handleDelete(image.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
