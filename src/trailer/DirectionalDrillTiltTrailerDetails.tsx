import { useState } from "react";
import { jsPDF } from "jspdf";
import { FileText, MapPin, Shield } from "lucide-react";
import { Link } from "@/lib/router";
import { directionalDrillTiltTrailer } from "@/trailer/trailerData";

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
    <div className="bg-[#efefef] min-h-screen py-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="bg-[#efefef] p-4 lg:p-6">
          <h1 className="text-4xl lg:text-6xl font-black text-[#bf1e2e] leading-tight mb-5">
            {directionalDrillTiltTrailer.title}
          </h1>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div>
              <img
                src={activeImage}
                alt={directionalDrillTiltTrailer.title}
                className="w-full h-[380px] object-cover border border-slate-300"
              />
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                {directionalDrillTiltTrailer.gallery.map((image) => (
                  <button
                    key={image}
                    onClick={() => setActiveImage(image)}
                    className={`border ${activeImage === image ? "border-[#bf1e2e]" : "border-slate-300"}`}
                    aria-label="Select trailer image"
                  >
                    <img
                      src={image}
                      alt="Trailer thumbnail"
                      className="w-full h-16 object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-slate-700 text-lg leading-relaxed mb-5">
                {directionalDrillTiltTrailer.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-slate-200 px-4 py-3 font-bold text-slate-800 hover:bg-slate-300 transition-colors"
                >
                  <MapPin size={18} className="text-[#bf1e2e]" />
                  Find a Dealer
                </a>
                <button
                  type="button"
                  onClick={handleDownloadBrochure}
                  className="inline-flex items-center gap-2 bg-slate-200 px-4 py-3 font-bold text-slate-800 hover:bg-slate-300 transition-colors"
                >
                  <FileText size={18} className="text-[#bf1e2e]" />
                  Download Brochure
                </button>
                <Link
                  to="/trailers/directional-drill-tilt-trailer/3d"
                  className="inline-flex items-center gap-2 bg-slate-900 px-4 py-3 font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  <Shield size={18} className="text-[#f03e4f]" />
                  3D Model Option
                </Link>
              </div>
            </div>
          </div>

          <section className="bg-gradient-to-r from-black via-slate-900 to-slate-700 text-white border-4 border-black p-5 mb-8">
            <h2 className="text-3xl font-black mb-4">Product Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {directionalDrillTiltTrailer.specs.slice(0, 7).map((spec) => (
                  <div
                    key={spec.label}
                    className="grid grid-cols-2 gap-3 border-b border-white/20 pb-2"
                  >
                    <div className="font-bold">{spec.label}</div>
                    <div>{spec.value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {directionalDrillTiltTrailer.specs.slice(7).map((spec) => (
                  <div
                    key={spec.label}
                    className="grid grid-cols-2 gap-3 border-b border-white/20 pb-2"
                  >
                    <div className="font-bold">{spec.label}</div>
                    <div>{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-4xl font-black text-slate-800 mb-4">Details</h3>
            <ul className="space-y-2 text-slate-700">
              {directionalDrillTiltTrailer.details.map((item) => (
                <li key={item} className="flex gap-2 items-start">
                  <span className="text-[#bf1e2e] text-xl leading-none">
                    &#8857;
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <Link
            to="/trailers"
            className="inline-flex items-center bg-slate-300 px-6 py-3 text-slate-800 font-bold hover:bg-slate-400 transition-colors"
          >
            Back to Listed Trailers
          </Link>
        </div>
      </div>
    </div>
  );
}
