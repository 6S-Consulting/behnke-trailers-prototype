import { useState } from "react";
import TrailerViewer, {
  CameraView,
} from "@/trailers/directionaldrill/3d/DirectionalDrillTrailer";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export function DirectionalDrillTiltTrailer3DPage() {
  const [tiltAngleDeg, setTiltAngleDeg] = useState(13);
  const [cameraView, setCameraView] = useState<CameraView>("perspective");
  const [autoRotate, setAutoRotate] = useState(true);
  const [showOptionalEquipment, setShowOptionalEquipment] = useState(false);
  const [showHoverLabels, setShowHoverLabels] = useState(true);

  return (
    <div className="bg-background min-h-screen">
      <Header />

      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="relative mb-6">
            <TrailerViewer
              tiltAngleDeg={tiltAngleDeg}
              cameraView={cameraView}
              showOptionalEquipment={showOptionalEquipment}
              autoRotate={autoRotate}
              showHoverLabels={showHoverLabels}
            />

            <aside className="absolute top-3 right-3 w-64 bg-background/70 backdrop-blur-md border border-border rounded-lg p-4 space-y-4">
              <h2 className="font-display text-sm font-black text-foreground uppercase tracking-widest">
                Engineering Controls
              </h2>

              <label className="font-display text-xs font-bold text-muted-foreground block">
                Camera View
                <select
                  value={cameraView}
                  onChange={(e) =>
                    setCameraView(e.target.value as CameraView)
                  }
                  className="mt-1 w-full border border-border rounded px-2 py-1.5 bg-card text-foreground text-xs"
                >
                  <option value="perspective">3/4 Perspective</option>
                  <option value="side">Side View</option>
                  <option value="top">Top View</option>
                </select>
              </label>

              <label className="font-display text-xs font-bold text-muted-foreground block">
                Tilt Angle: {tiltAngleDeg.toFixed(1)}°
                <input
                  type="range"
                  min={0}
                  max={13}
                  step={0.5}
                  value={tiltAngleDeg}
                  onChange={(e) => setTiltAngleDeg(Number(e.target.value))}
                  className="mt-1 w-full accent-primary"
                />
              </label>

              <div className="flex flex-col gap-2 pt-1">
                <label className="inline-flex items-center gap-2 font-display text-xs text-muted-foreground font-semibold">
                  <input
                    type="checkbox"
                    checked={autoRotate}
                    onChange={(e) => setAutoRotate(e.target.checked)}
                  />
                  Auto rotate model
                </label>
                <label className="inline-flex items-center gap-2 font-display text-xs text-muted-foreground font-semibold">
                  <input
                    type="checkbox"
                    checked={showOptionalEquipment}
                    onChange={(e) =>
                      setShowOptionalEquipment(e.target.checked)
                    }
                  />
                  Show optional mounts
                </label>
                <label className="inline-flex items-center gap-2 font-display text-xs text-muted-foreground font-semibold">
                  <input
                    type="checkbox"
                    checked={showHoverLabels}
                    onChange={(e) => setShowHoverLabels(e.target.checked)}
                  />
                  Show part labels on hover
                </label>
              </div>
            </aside>
          </div>

          <div className="mt-8 flex gap-3">
            <Link
              to="/trailers/directional-drill-tilt-trailer"
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-sm font-display font-semibold hover:brightness-110 transition-all"
            >
              Back to Details
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
