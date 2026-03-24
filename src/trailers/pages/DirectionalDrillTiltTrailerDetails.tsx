import { useState } from "react";
import { jsPDF } from "jspdf";
import { FileText, MapPin, Shield, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { directionalDrillTiltTrailer } from "@/trailers/data/trailerData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export function DirectionalDrillTiltTrailerDetails() {
  const [activeImage, setActiveImage] = useState(
    directionalDrillTiltTrailer.gallery[0],
  );

  const handleDownloadBrochure = () => {
    const pdf = new jsPDF({ unit: "pt", format: "letter" });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text("Directional Drill Tilt Trailer", 40, 52);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    const descriptionLines = pdf.splitTextToSize(
      directionalDrillTiltTrailer.description,
      532,
    );
    pdf.text(descriptionLines, 40, 80);

    let y = 140;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Specifications", 40, y);
    y += 20;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    directionalDrillTiltTrailer.specs.forEach((spec) => {
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
    pdf.text("Details", 40, y);
    y += 18;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    directionalDrillTiltTrailer.details.forEach((detail) => {
      if (y > 740) {
        pdf.addPage();
        y = 50;
      }
      const lines = pdf.splitTextToSize(`- ${detail}`, 532);
      pdf.text(lines, 40, y);
      y += lines.length * 14 + 2;
    });

    pdf.save(directionalDrillTiltTrailer.brochureFileName);
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
              {directionalDrillTiltTrailer.title}
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
                alt={directionalDrillTiltTrailer.title}
                className="w-full h-[380px] object-cover border border-border"
                layoutId="active-image"
              />
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                {directionalDrillTiltTrailer.gallery.map((image, idx) => (
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
                {directionalDrillTiltTrailer.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link to="/customer/contact">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 bg-[#bf1e2e] text-white px-4 py-3 font-display font-bold hover:bg-[#bf1e2e]/90 transition-colors border border-[#bf1e2e]"
                  >
                    <Send size={18} />
                    Request a Quote
                  </motion.div>
                </Link>
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
                    to="/trailers/directional-drill-tilt-trailer/3d"
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
                {directionalDrillTiltTrailer.specs
                  .slice(0, 7)
                  .map((spec, idx) => (
                    <motion.div
                      key={spec.label}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="grid grid-cols-2 gap-3 border-b border-white/20 pb-2"
                    >
                      <div className="font-display font-bold text-sm">
                        {spec.label}
                      </div>
                      <div className="font-body text-sm">{spec.value}</div>
                    </motion.div>
                  ))}
              </div>
              <div className="space-y-3">
                {directionalDrillTiltTrailer.specs.slice(7).map((spec, idx) => (
                  <motion.div
                    key={spec.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 + 0.35 }}
                    className="grid grid-cols-2 gap-3 border-b border-white/20 pb-2"
                  >
                    <div className="font-display font-bold text-sm">
                      {spec.label}
                    </div>
                    <div className="font-body text-sm">{spec.value}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h3 className="font-display text-4xl font-black text-foreground mb-4">
              Details
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              {directionalDrillTiltTrailer.details.map((item, idx) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex gap-2 items-start"
                >
                  <span className="text-[#bf1e2e] text-xl leading-none flex-shrink-0">
                    &#8857;
                  </span>
                  <span className="font-body">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h3 className="font-display text-4xl font-black text-foreground mb-6">
              Key Advantages
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {directionalDrillTiltTrailer.keyAdvantages.map((adv, idx) => (
                <motion.div
                  key={adv}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card border border-border p-6 rounded-sm text-center flex flex-col items-center gap-3"
                >
                  <Shield size={24} className="text-[#bf1e2e]" />
                  <span className="font-display font-bold text-sm uppercase tracking-wide">
                    {adv}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/trailers"
              className="inline-flex items-center bg-primary text-primary-foreground px-6 py-3 font-display font-semibold rounded-sm hover:brightness-110 transition-all"
            >
              Back to Listed Trailers
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
