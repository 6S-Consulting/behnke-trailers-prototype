import { useMemo, useState } from "react";
import TrailerViewer, {
  AxleRating,
  CameraView,
  DeckWood,
  HitchType,
  LengthOption,
  TiltSide,
} from "@/trailer/DirectionalDrillTrailer";
import { Link } from "@/lib/router";
import { directionalDrillTiltTrailer } from "@/trailer/trailerData";

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
    <div className="bg-slate-100 min-h-screen py-10">
      <div className="container mx-auto px-4 lg:px-8">
        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-3">
          Directional Drill Tilt Trailer - 3D Model
        </h1>
        <p className="text-slate-600 mb-8 max-w-3xl">
          Interactive engineering visualization at real-world scale (inches).
          Orbit to inspect chassis geometry, tilt deck structure, axle
          packaging, and hitch components.
        </p>
        <p className="text-slate-700 mb-6 max-w-4xl">
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

          <aside className="order-1 xl:order-2 bg-white border border-slate-200 rounded-lg p-5 space-y-5">
            <h2 className="text-xl font-black text-slate-900">
              Engineering Controls
            </h2>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm font-bold text-slate-700">
                Front Deck Length
                <select
                  value={frontDeckLengthFt}
                  onChange={(e) =>
                    setFrontDeckLengthFt(Number(e.target.value) as LengthOption)
                  }
                  className="mt-1 w-full border border-slate-300 rounded px-2 py-2"
                >
                  <option value={4}>4 ft + 18 ft</option>
                  <option value={6}>6 ft + 18 ft</option>
                  <option value={8}>8 ft + 18 ft</option>
                </select>
              </label>

              <label className="text-sm font-bold text-slate-700">
                Axle Rating
                <select
                  value={axleRating}
                  onChange={(e) =>
                    setAxleRating(Number(e.target.value) as AxleRating)
                  }
                  className="mt-1 w-full border border-slate-300 rounded px-2 py-2"
                >
                  <option value={8000}>8K Torflex Dexter</option>
                  <option value={10000}>10K Torflex Dexter</option>
                  <option value={12000}>12K Torflex Dexter</option>
                </select>
              </label>

              <label className="text-sm font-bold text-slate-700">
                Decking
                <select
                  value={deckWood}
                  onChange={(e) => setDeckWood(e.target.value as DeckWood)}
                  className="mt-1 w-full border border-slate-300 rounded px-2 py-2"
                >
                  <option value="treated-pine">1-1/2 in treated pine</option>
                  <option value="white-oak">1-11/16 in white oak</option>
                </select>
              </label>

              <label className="text-sm font-bold text-slate-700">
                Hitch
                <select
                  value={hitchType}
                  onChange={(e) => setHitchType(e.target.value as HitchType)}
                  className="mt-1 w-full border border-slate-300 rounded px-2 py-2"
                >
                  <option value="coupler">2-5/16 in adjustable coupler</option>
                  <option value="pintle">Pintle hitch</option>
                </select>
              </label>

              <label className="text-sm font-bold text-slate-700">
                Tilt Side
                <select
                  value={tiltSide}
                  onChange={(e) => setTiltSide(e.target.value as TiltSide)}
                  className="mt-1 w-full border border-slate-300 rounded px-2 py-2"
                >
                  <option value="driver">Driver side</option>
                  <option value="passenger">Passenger side (optional)</option>
                </select>
              </label>

              <label className="text-sm font-bold text-slate-700">
                Camera View
                <select
                  value={cameraView}
                  onChange={(e) => setCameraView(e.target.value as CameraView)}
                  className="mt-1 w-full border border-slate-300 rounded px-2 py-2"
                >
                  <option value="perspective">3/4 Perspective</option>
                  <option value="side">Side View</option>
                  <option value="top">Top View</option>
                </select>
              </label>
            </div>

            <div className="flex flex-wrap gap-5 pt-1">
              <label className="inline-flex items-center gap-2 text-sm text-slate-800 font-semibold">
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

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-500 mb-2">
                Active Configuration
              </h3>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>
                  Total length: {frontDeckLengthFt + 18} ft (
                  {(frontDeckLengthFt + 18) * 12} in)
                </li>
                <li>
                  Deck split: Tilt 55.5 in / Stationary 26.5 in / 83 in between
                  fenders
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

        <section className="bg-white border border-slate-200 rounded-lg p-5 mb-8">
          <h2 className="text-xl font-black text-slate-900 mb-3">
            Spec Source (details.md + trailer data)
          </h2>
          <div className="grid lg:grid-cols-2 gap-5">
            <ul className="space-y-2 text-slate-700">
              {directionalDrillTiltTrailer.specs.map((spec) => (
                <li
                  key={spec.label}
                  className="flex justify-between gap-4 border-b border-slate-100 pb-1"
                >
                  <span className="font-semibold">{spec.label}</span>
                  <span className="text-right">{spec.value}</span>
                </li>
              ))}
            </ul>
            <ul className="space-y-2 text-slate-700">
              {directionalDrillTiltTrailer.details.map((detail) => (
                <li key={detail} className="flex gap-2">
                  <span className="text-[#bf1e2e]">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 mt-6 pt-5 border-t border-slate-200">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-500 mb-2">
                Key Advantages
              </h3>
              <ul className="space-y-1 text-slate-700">
                {directionalDrillTiltTrailer.keyAdvantages.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[#bf1e2e]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-500 mb-2">
                Optional Features
              </h3>
              <ul className="space-y-1 text-slate-700">
                {directionalDrillTiltTrailer.optionalFeatures.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[#bf1e2e]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-500 mb-2">
                Resources
              </h3>
              <ul className="space-y-1 text-slate-700">
                {directionalDrillTiltTrailer.resources.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[#bf1e2e]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-5 mb-8">
          <h2 className="text-xl font-black text-slate-900 mb-3">
            Reference Images Used For Model Polish
          </h2>
          <p className="text-slate-600 mb-4">
            Geometry refinements were aligned to these photos: dual-deck split,
            rear beavertail/ramp shape, toolbox position, blue reel placement,
            side reflector striping, and overall wheel/fender stance.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {directionalDrillTiltTrailer.gallery.map((image, idx) => (
              <figure
                key={image}
                className="border border-slate-200 rounded overflow-hidden bg-slate-50"
              >
                <img
                  src={image}
                  alt={`Directional drill trailer reference ${idx + 1}`}
                  className="w-full h-36 object-cover"
                  loading="lazy"
                />
                <figcaption className="text-xs font-semibold text-slate-600 px-2 py-1.5">
                  Reference {idx + 1}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <div className="mt-8 flex gap-3">
          <Link
            to="/trailers/directional-drill-tilt-trailer"
            className="bg-slate-800 text-white px-5 py-2.5 rounded font-bold hover:bg-slate-700 transition-colors"
          >
            Back to Product Details
          </Link>
          <Link
            to="/trailers"
            className="bg-slate-200 text-slate-900 px-5 py-2.5 rounded font-bold hover:bg-slate-300 transition-colors"
          >
            Back to Trailers
          </Link>
        </div>
      </div>
    </div>
  );
}
