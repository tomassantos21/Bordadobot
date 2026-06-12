import { Link } from "react-router";
import { Sparkles, ArrowRight, Palette, Wand2, ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { motion } from "motion/react";

export default function Home() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      const yOffset = -80; // Offset for navigation bar
      const y = featuresSection.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-accent/20">
      {/* Hero Section */}
      <section className="relative container mx-auto px-6 sm:px-8 lg:px-4 pt-16 pb-16 lg:pt-32 lg:pb-32 min-h-screen flex flex-col justify-center">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-8xl mb-6 sm:mb-8 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent font-bold">
            BordadoBot
          </h1>

          <p className="text-base sm:text-xl lg:text-3xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
            Transform your photographs into exquisite Portuguese embroidery art
            through the magic of neural style transfer
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-2">
            <Button size="lg" className="gap-2 px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto" asChild>
              <Link to="/create">
                Start Creating
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto" asChild>
              <Link to="/gallery">
                <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
                View Gallery
              </Link>
            </Button>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="mt-12 sm:mt-16 flex flex-col items-center gap-2 cursor-pointer"
            onClick={scrollToFeatures}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-xs sm:text-sm text-muted-foreground">Scroll to explore</span>
            <div className="w-10 h-10 rounded-full border-2 border-primary/30 flex items-center justify-center hover:border-primary/60 hover:bg-primary/5 transition-colors">
              <ChevronDown className="w-5 h-5 text-primary" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 sm:px-8 lg:px-4 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0 }}
            whileHover={{
              y: -8,
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
          >
            <Card className="p-6 sm:p-10 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all h-full">
              <motion.div
                className="w-12 h-12 sm:w-16 sm:h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 sm:mb-6"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Wand2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </motion.div>
              <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl">Neural Style Transfer</h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Advanced AI algorithms transform your images using authentic
                Castelo Branco embroidery patterns and textures.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{
              y: -8,
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
          >
            <Card className="p-6 sm:p-10 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all h-full">
              <motion.div
                className="w-12 h-12 sm:w-16 sm:h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 sm:mb-6"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </motion.div>
              <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl">Artisan Quality</h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Each transformation captures the delicate threadwork and rich
                color palette of traditional Portuguese embroidery.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{
              y: -8,
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
          >
            <Card className="p-6 sm:p-10 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 hover:shadow-xl transition-all h-full">
              <motion.div
                className="w-12 h-12 sm:w-16 sm:h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 sm:mb-6"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </motion.div>
              <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl">Instant Results</h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Upload your image and watch as it transforms into a stunning
                piece of digital embroidery art in moments.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 sm:px-8 lg:px-4 pb-16 sm:pb-24">
        <Card className="max-w-5xl mx-auto p-8 sm:p-16 bg-gradient-to-br from-primary/5 to-accent/30 border-primary/30 text-center">
          <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl lg:text-4xl">Ready to Create Your Masterpiece?</h2>
          <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-10 leading-relaxed max-w-3xl mx-auto">
            Join our community of artists and craft enthusiasts exploring the
            intersection of tradition and technology
          </p>
          <Button size="lg" className="gap-2 px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto" asChild>
            <Link to="/create">
              Get Started Free
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}
