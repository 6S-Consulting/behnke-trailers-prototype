import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TwoDtoThreeDSection from "@/components/TwoDtoThreeDSection";
import DiscoverySection from "@/components/DiscoverySection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <HeroSection />
      <div id="industries">
        <DiscoverySection />
      </div>
      <div id="custom-builds">
        <TwoDtoThreeDSection />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
