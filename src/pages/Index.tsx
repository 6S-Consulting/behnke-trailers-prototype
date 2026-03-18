import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DiscoverySection from "@/components/DiscoverySection";
import CustomSection from "@/components/CustomSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <HeroSection />
      <DiscoverySection />
      <CustomSection />
      <Footer />
    </div>
  );
};

export default Index;
