export type TrailerSpec = {
  label: string;
  value: string;
};

export type TrailerProduct = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  overview: string;
  heroImage: string;
  gallery: string[];
  brochureFileName: string;
  specs: TrailerSpec[];
  details: string[];
  keyAdvantages: string[];
  optionalFeatures: string[];
  resources: string[];
};

import heroImage from "@/trailers/images/image.png";
import trailer03 from "@/trailers/images/trailer-03.png";
import trailer04 from "@/trailers/images/trailer-04.png";
import trailer05 from "@/trailers/images/trailer-05.png";
import trailer06 from "@/trailers/images/trailer-06.png";

export const directionalDrillTiltTrailer: TrailerProduct = {
  slug: "directional-drill-tilt-trailer",
  title: "Directional Drill Tilt Trailer",
  shortDescription:
    "Dual-deck tilt trailer designed for directional drill transport with safer loading geometry.",
  description:
    "The directional drill trailer is a heavy-duty transport platform that uses a tilting deck on the driver side and a fixed deck on the passenger side. It is built to carry directional drills plus mounted support equipment while reducing ramp dependency during loading.",
  overview:
    "Patented dual-deck configuration with a tilting driver-side deck and fixed passenger-side deck, designed for safer drill loading without ramps.",
  heroImage: heroImage,
  gallery: [heroImage, trailer03, trailer04, trailer05, trailer06],
  brochureFileName: "directional-drill-tilt-trailer-brochure.pdf",
  specs: [
    { label: "GVWR", value: "16,000 lb - 24,000 lb" },
    { label: "Weight", value: "6,200 lb (2220) / 6,700 lb (2224)" },
    { label: "Length", value: "(4 + 18) ft, (6 + 18) ft, (8 + 18) ft options" },
    {
      label: "Width",
      value:
        "Tilt deck 55.5 in, stationary deck 26.5 in, 83 in between fenders",
    },
    { label: "Unloaded Deck Height", value: "25 in" },
    {
      label: "Frame",
      value: "5 x 5 x 5/16 in angle upper frame, 2 x 8 in tube lower frame",
    },
    { label: "Side Rails", value: "5 x 5 x 5/16 in angle (flush floor)" },
    { label: "Crossmembers", value: "3 in channel at 12 in centers" },
    { label: "Axles", value: "Tandem Torflex: 8K, 10K, or 12K options" },
    { label: "Suspension", value: "Torflex" },
    {
      label: "Tire and Wheel",
      value: "215/75R17.5 or 235/75R17.5 heavy-duty trailer tires",
    },
    { label: "Decking", value: "1.5 in treated pine or white oak" },
    { label: "Fenders", value: "Fully welded steel fenders, 11 gauge" },
    {
      label: "Hitch",
      value: "Adjustable 2-5/16 in coupler or pintle with 12K drop-leg jack",
    },
    { label: "Jack", value: "Single 12K drop-leg" },
    {
      label: "Tie-Downs",
      value: "Stake pockets and four heavy-duty D-rings on tilt deck",
    },
    { label: "Safety Chains", value: "(2) 3/8 in Grade 70" },
    { label: "Storage", value: "Chain tray in tongue" },
    { label: "Lights", value: "LED flush mount brake and side marker lights" },
    { label: "Elect. Plug", value: "RV plug" },
    {
      label: "Finish",
      value: "Bead blasted, zinc rich primed, industrial powder coat",
    },
  ],
  details: [
    "Tilting deck on driver side and fixed deck on passenger side for safer directional drill loading.",
    "Hydraulic or gravity tilt geometry with hinge pivot near axle centerline.",
    "Dual 3/8 in Grade 70 safety chains and integrated chain storage tray at tongue.",
    "Optional machine stops, boring bar holders, reel mounts, and tank mounts.",
  ],
  keyAdvantages: [
    "No ramps required for loading workflow",
    "Dual-deck organization for drill plus support equipment",
    "Heavy-duty structure for high payload capacity",
    "Configurable for field-specific mounting layouts",
  ],
  optionalFeatures: [
    "Machine stops",
    "Boring bar holders",
    "Tank mounts",
    "Additional custom mounting solutions",
  ],
  resources: ["Find a Dealer", "Download Brochure", "Explore Product Options"],
};

export const trailers: TrailerProduct[] = [directionalDrillTiltTrailer];
