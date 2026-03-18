import { useMemo, useState } from "react";
import TrailerViewer, {
  AxleRating,
  CameraView,
  DeckWood,
  HitchType,
  LengthOption,
  TiltSide,
} from "@/trailers/DirectionalDrillTrailer";
import { Link } from "react-router-dom";
import { directionalDrillTiltTrailer } from "@/trailers/trailerData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export function DirectionalDrillTiltTrailer3DPage() {
  const [frontDeckLengthFt, setFrontDeckLengthFt] = useState<LengthOption>(4);
  const [axleRating, setAxleRating] = useState<AxleRating>(10000);
  const [deckWood, setDeckWood] = useState<DeckWood>("treated-pine");
  const [hitchType, setHitchType] = useState<HitchType>("coupler");
  const [tiltSide, setTiltSide] = useState<TiltSide>("driver");
  const [cameraView, setCameraView] = useState<CameraView>("perspective");
  const [autoRotate, setAutoRotate] = useState(true);
  const [showOptionalEquipment, setShowOptionalEquipment] = useState(true);

  const tireSpec = useMemo(
    () => (axleRating === 8000 ? "215/75R-17.5" : "235/75R-17.5"),
    [axleRating],
  );

  return (
    <div className="bg-background min-h-screen">
      <Header />

      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-3">
            Directional Drill Tilt Trailer - 3D Model
          </h1>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Interactive engineering visualization at real-world scale (inches).
            Orbit to inspect chassis geometry, tilt deck structure, axle
            packaging, and hitch components.
          </p>
          <p className="text-muted-foreground mb-6 max-w-4xl">
            {directionalDrillTiltTrailer.overview}
          </p>

          <div className="grid xl:grid-cols-[1.35fr_1fr] gap-6 mb-6">
            <div className="order-2 xl:order-1">
              <TrailerViewer
                frontDeckLengthFt={frontDeckLengthFt}
                axleRating={axleRating}
                deckWood={deckWood}
                hitchType={hitchType}
                tiltSide={tiltSide}
                cameraView={cameraView}
                showOptionalEquipment={showOptionalEquipment}
                autoRotate={autoRotate}
              />
            </div>

            <aside className="order-1 xl:order-2 bg-background/50 backdrop-blur-sm border border-border rounded-lg p-5 space-y-5">
              <h2 className="text-xl font-black text-foreground">
                Engineering Controls
              </h2>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-sm font-bold text-muted-foreground">
                  Front Deck Length
                  <select
                    value={frontDeckLengthFt}
                    onChange={(e) =>
                      setFrontDeckLengthFt(
                        Number(e.target.value) as LengthOption,
                      )
                    }
                    className="mt-1 w-full border border-border rounded px-2 py-2 bg-card text-foreground"
                  >
                    <option value={4}>4 ft + 18 ft</option>
                    <option value={6}>6 ft + 18 ft</option>
                    <option value={8}>8 ft + 18 ft</option>
                  </select>
                </label>

                <label className="text-sm font-bold text-muted-foreground">
                  Axle Rating
                  <select
                    value={axleRating}
                    onChange={(e) =>
                      setAxleRating(Number(e.target.value) as AxleRating)
                    }
                    className="mt-1 w-full border border-border rounded px-2 py-2 bg-card text-foreground"
                  >
                    <option value={8000}>8K Torflex Dexter</option>
                    <option value={10000}>10K Torflex Dexter</option>
                    <option value={12000}>12K Torflex Dexter</option>
                  </select>
                </label>

                <label className="text-sm font-bold text-muted-foreground">
                  Decking
                  <select
                    value={deckWood}
                    onChange={(e) => setDeckWood(e.target.value as DeckWood)}
                    className="mt-1 w-full border border-border rounded px-2 py-2 bg-card text-foreground"
                  >
                    <option value="treated-pine">1-1/2 in treated pine</option>
                    <option value="white-oak">1-11/16 in white oak</option>
                  </select>
                </label>

                <label className="text-sm font-bold text-muted-foreground">
                  Hitch
                  <select
                    value={hitchType}
                    onChange={(e) => setHitchType(e.target.value as HitchType)}
                    className="mt-1 w-full border border-border rounded px-2 py-2 bg-card text-foreground"
                  >
                    <option value="coupler">
                      2-5/16 in adjustable coupler
                    </option>
                    <option value="pintle">Pintle hitch</option>
                  </select>
                </label>

                <label className="text-sm font-bold text-muted-foreground">
                  Tilt Side
                  <select
                    value={tiltSide}
                    onChange={(e) => setTiltSide(e.target.value as TiltSide)}
                    className="mt-1 w-full border border-border rounded px-2 py-2 bg-card text-foreground"
                  >
                    <option value="driver">Driver side</option>
                    <option value="passenger">Passenger side (optional)</option>
                  </select>
                </label>

                <label className="text-sm font-bold text-muted-foreground">
                  Camera View
                  <select
                    value={cameraView}
                    onChange={(e) =>
                      setCameraView(e.target.value as CameraView)
                    }
                    className="mt-1 w-full border border-border rounded px-2 py-2 bg-card text-foreground"
                  >
                    <option value="perspective">3/4 Perspective</option>
                    <option value="side">Side View</option>
                    <option value="top">Top View</option>
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap gap-5 pt-1">
                <label className="inline-flex items-center gap-2 text-sm text-muted-foreground font-semibold">
                  <input
                    type="checkbox"
                    checked={autoRotate}
                    onChange={(e) => setAutoRotate(e.target.checked)}
                  />
                  Auto rotate model
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-800 font-semibold">
                  <input
                    type="checkbox"
                    checked={showOptionalEquipment}
                    onChange={(e) => setShowOptionalEquipment(e.target.checked)}
                  />
                  Show optional mounts
                </label>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-muted-foreground mb-2">
                  Active Configuration
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    Total length: {frontDeckLengthFt + 18} ft (
                    {(frontDeckLengthFt + 18) * 12} in)
                  </li>
                  <li>
                    Deck split: Tilt 55.5 in / Stationary 26.5 in / 83 in
                    between fenders
                  </li>
                  <li>Deck height: 25 in</li>
                  <li>Axles: Tandem {axleRating / 1000}K Torflex</li>
                  <li>Tires: {tireSpec}</li>
                  <li>
                    Hitch:{" "}
                    {hitchType === "coupler" ? "2-5/16 in coupler" : "pintle"}
                  </li>
                </ul>
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
