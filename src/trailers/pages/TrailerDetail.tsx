import { useState } from "react";
import { jsPDF } from "jspdf";
import { FileText, MapPin, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrailerProduct } from "@/trailers/data/trailerData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface TrailerDetailProps {
  trailer: TrailerProduct;
}

export function TrailerDetail({ trailer }: TrailerDetailProps) {
  const [activeImage, setActiveImage] = useState(trailer.gallery[0]);

  const handleDownloadBrochure = () => {
    const pdf = new jsPDF({ unit: "pt", format: "letter" });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text(trailer.title, 40, 52);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    const descriptionLines = pdf.splitTextToSize(trailer.description, 532);
    pdf.text(descriptionLines, 40, 80);

    let y = 140;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Specifications", 40, y);
    y += 20;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    trailer.specs.forEach((spec) => {
      if (y > 740) {
        pdf.addPage();
        y = 50;
      }
      const line = `${spec.label}: ${spec.value}`;
      const lines = pdf.splitTextToSize(line, 532);
      pdf.text(lines, 40, y);
      y += lines.length * 14 + 2;
    });

    y += 8;
    if (y > 720) {
      pdf.addPage();
      y = 50;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Key Details", 40, y);
    y += 18;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    trailer.details.forEach((detail) => {
      if (y > 740) {
        pdf.addPage();
        y = 50;
      }
      const lines = pdf.splitTextToSize(`- ${detail}`, 532);
      pdf.text(lines, 40, y);
      y += lines.length * 14 + 2;
    });

    pdf.save(trailer.brochureFileName);
  };

  return (
    <div className="bg-background min-h-screen">
      <Header />

      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="font-display text-4xl lg:text-6xl font-black text-[#bf1e2e] leading-tight">
              {trailer.title}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid lg:grid-cols-2 gap-6 mb-8"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <motion.img
                src={activeImage}
                alt={trailer.title}
                className="w-full h-[380px] object-cover border border-border"
                layoutId="active-image"
              />
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                {trailer.gallery.map((image, idx) => (
                  <motion.button
                    key={image}
                    onClick={() => setActiveImage(image)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + idx * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`border ${activeImage === image ? "border-[#bf1e2e]" : "border-border"}`}
                    aria-label="Select trailer image"
                  >
                    <img
                      src={image}
                      alt="Trailer thumbnail"
                      className="w-full h-16 object-cover"
                      loading="lazy"
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <p className="font-body text-muted-foreground text-lg leading-relaxed mb-5">
                {trailer.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 bg-card text-foreground px-4 py-3 font-display font-bold hover:bg-card/80 transition-colors border border-border"
                >
                  <MapPin size={18} className="text-[#bf1e2e]" />
                  Find a Dealer
                </motion.a>
                <motion.button
                  type="button"
                  onClick={handleDownloadBrochure}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 bg-card text-foreground px-4 py-3 font-display font-bold hover:bg-card/80 transition-colors border border-border"
                >
                  <FileText size={18} className="text-[#bf1e2e]" />
                  Download Brochure
                </motion.button>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={`/trailers/${trailer.slug}/3d`}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 font-display font-bold hover:brightness-110 transition-colors w-full justify-center sm:w-auto"
                  >
                    <Shield size={18} className="text-[#f03e4f]" />
                    3D Model Option
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-black via-slate-900 to-slate-700 text-white border-4 border-black p-5 mb-8 rounded-sm"
          >
            <h2 className="font-display text-3xl font-black mb-4">
              Product Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {trailer.specs.slice(0, Math.ceil(trailer.specs.length / 2)).map((spec, idx) => (
                  <motion.div
                    key={spec.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="grid grid-cols-2 gap-3 border-b border-white/20 pb-2"
                  >
                    <span className="font-semibold text-sm">{spec.label}</span>
                    <span className="text-sm">{spec.value}</span>
                  </motion.div>
                ))}
              </div>
              <div className="space-y-3">
                {trailer.specs.slice(Math.ceil(trailer.specs.length / 2)).map((spec, idx) => (
                  <motion.div
                    key={spec.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (Math.ceil(trailer.specs.length / 2) + idx) * 0.05 }}
                    className="grid grid-cols-2 gap-3 border-b border-white/20 pb-2"
                  >
                    <span className="font-semibold text-sm">{spec.label}</span>
                    <span className="text-sm">{spec.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="border border-border p-6"
            >
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                Key Advantages
              </h3>
              <ul className="space-y-3">
                {trailer.keyAdvantages.map((advantage, idx) => (
                  <motion.li
                    key={advantage}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-[#bf1e2e] font-bold mt-1">•</span>
                    <span className="font-body text-muted-foreground">{advantage}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="border border-border p-6"
            >
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                Optional Features
              </h3>
              <ul className="space-y-3">
                {trailer.optionalFeatures.map((feature, idx) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-[#bf1e2e] font-bold mt-1">•</span>
                    <span className="font-body text-muted-foreground">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.section>
          </div>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border border-border p-6 mb-8"
          >
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">
              Details
            </h3>
            <ul className="space-y-2">
              {trailer.details.map((detail, idx) => (
                <motion.li
                  key={detail}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-[#bf1e2e] font-bold mt-1">✓</span>
                  <span className="font-body text-muted-foreground">{detail}</span>
                </motion.li>
              ))}
            </ul>
          </motion.section>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {trailer.resources.map((resource, idx) => (
              <motion.button
                key={resource}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-primary text-primary-foreground px-6 py-3 font-display font-bold hover:brightness-110 transition-all"
              >
                {resource}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
