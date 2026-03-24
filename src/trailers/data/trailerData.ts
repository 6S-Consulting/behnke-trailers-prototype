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

import heroImage from "@/trailers/directionaldrill/images/image.jpg";
import tubeTilt1 from "@/trailers/tubetilt/images/1.jpg";
import tubeTilt2 from "@/trailers/tubetilt/images/2.jpg";
import tubeTilt3 from "@/trailers/tubetilt/images/3.jpg";
import tubeTilt4 from "@/trailers/tubetilt/images/4.jpg";
import trailer03 from "@/trailers/directionaldrill/images/trailer-03.jpg";
import trailer04 from "@/trailers/directionaldrill/images/trailer-04.jpg";
import trailer05 from "@/trailers/directionaldrill/images/trailer-05.jpg";
import trailer06 from "@/trailers/directionaldrill/images/trailer-06.jpg";

import image0 from "@/trailers/WalkingTandemGooseneckWagon/images/image 0.jpg";
import image1 from "@/trailers/WalkingTandemGooseneckWagon/images/image1.jpg";
import image2 from "@/trailers/WalkingTandemGooseneckWagon/images/image 2.jpg";
import image3 from "@/trailers/WalkingTandemGooseneckWagon/images/image 3.jpg";
import image4 from "@/trailers/WalkingTandemGooseneckWagon/images/image 4.jpg";
import image5 from "@/trailers/WalkingTandemGooseneckWagon/images/image 5.jpg";
import image6 from "@/trailers/WalkingTandemGooseneckWagon/images/image 6.jpg";
import image7 from "@/trailers/WalkingTandemGooseneckWagon/images/image 7.jpg";
import paverTag1 from "@/trailers/pavertag/images/1.jpg";
import paverTag2 from "@/trailers/pavertag/images/2.jpg";
import paverTag3 from "@/trailers/pavertag/images/3.jpg";
import paverTag4 from "@/trailers/pavertag/images/4.jpg";
import paverTag5 from "@/trailers/pavertag/images/5.jpg";

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
    "Patented split tilt design for maximum safety",
    "No ramps required for loading workflow",
    "Dual-deck organization for drill plus support equipment",
    "Heavy-duty 2 x 8 in tube lower frame construction",
    "Low 25 in unloaded deck height",
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

export const tubeTilt20K: TrailerProduct = {
  slug: "20k-hd-tube-tilt",
  title: "20K HD Tube Tilt",
  shortDescription:
    "The pioneer in the tandem axle 20K GVWR low-profile tube tilt market.",
  description:
    "The 20K tube tilt is a beast of a trailer, with no peers in its class, and is equipped with twin 10K torflex axles with 17.5 super single tires. The trailer is built with a heavy duty frame, while still maintaining a full 83\" between the fenders and has an added standard option of fender guards. It is available with 2-8' stationary decks, with either 16' or 18' of tilt. Pull-type and gooseneck configurations are available.",
  overview:
    "Heavy-duty tube tilt trailer with 20,000 lb GVWR, super single tires, and industry-leading low-profile design.",
  heroImage: tubeTilt1,
  gallery: [tubeTilt1, tubeTilt2, tubeTilt3, tubeTilt4],
  brochureFileName: "20k-hd-tube-tilt-brochure.pdf",
  specs: [
    { label: "GVWR", value: "20,000 lbs." },
    { label: "Weight", value: "5,050 lbs." },
    { label: "Length", value: "4' stationary + 16' tilt" },
    { label: "Width", value: '83" between fenders' },
    { label: "Frame", value: "8 x 2 x 1/4 tube" },
    { label: "Unloaded Deck Height", value: '25"' },
    { label: "Side Rails", value: "5 x 5 x 5/16 angle (flush floor)" },
    { label: "Crossmembers", value: '3" channels (12" ¢\'s)' },
    { label: "Fenders", value: "HD Fully Welded 11 gauge" },
    { label: "Jack", value: "Single 12K dropleg" },
    { label: "Hitch", value: '2 5/16" adj. coupler or pintle' },
    { label: "Safety Chains", value: '(2) 3/8" Gr. 70' },
    { label: "Tie-Downs", value: "stake pockets and (4) D-rings" },
    { label: "Storage", value: "Chain tray in tongue" },
    { label: "Axles", value: "10,000 lb. Dexter" },
    { label: "Suspension", value: "Torflex" },
    { label: "Tire and Wheel", value: "235/75R-17.5 16 ply super single" },
    { label: "Decking", value: "2 x 8 No. 1 Treated pine" },
    { label: "Lights", value: "LED flush mount" },
    { label: "Elect. Plug", value: "RV plug" },
    {
      label: "Finish and Paint",
      value: "Bead blasted, acid washed, zinc rich primed, powder coated",
    },
  ],
  details: [
    "The pioneer in the tandem axle 20K GVWR low-profile tilt market",
    "Pallet fork holders and fender guides",
    "flush floor",
    'true 83" wide between fenders',
    "Able to add bolt-on toolbox or spare tire mount on standard trailer",
  ],
  keyAdvantages: [
    "Maximum payload capacity",
    "Low-profile loading angle",
    "Superior stability with super single tires",
    "Heavy-duty tube frame construction",
  ],
  optionalFeatures: [
    "Gooseneck configuration",
    "Bolt-on toolbox",
    "Spare tire mount",
    "Various stationary deck lengths",
  ],
  resources: ["Find a Dealer", "Download Brochure", "Explore Product Options"],
};
export const walkingTandemGooseneckWagon: TrailerProduct = {
  slug: "walking-tandem-gooseneck-wagon",
  title: "Walking Tandem Gooseneck Wagon (Twin 1450 gal. Tanks)",
  shortDescription:
    "The GN2900TWG will be our best running gear for navigating difficult terrain.",
  description:
    "The GN2900TWG will be our best running gear for navigating difficult terrain. With a rear walking tandem pivoting axle, this model is versatile enough to sit on uneven terrain and built heavy enough to take the stress. Pairing the rear walking tandem with a torflex front axle will make this the smoothest riding running gear in your fleet.",
  overview:
    "Specialized gooseneck wagon featuring walking tandem axles for extreme terrain stability and heavy payload capacity.",
  heroImage: image0,
  gallery: [image0, image1, image2, image3, image4, image5, image6, image7],
  brochureFileName: "walking-tandem-gooseneck-wagon-brochure.pdf",
  specs: [
    { label: "GVWR", value: "32,000 lbs" },
    { label: "Weight", value: "8,500 lb - 12,000 lb" },
    { label: "Length", value: "24 ft to 40 ft options" },
    { label: "Width", value: "102 in" },
    { label: "Unloaded Deck Height", value: "36 in" },
    { label: "Frame", value: '12" x 22 lb. I-beam' },
    { label: "Side Rails", value: "6 in Channel" },
    {
      label: "Crossmembers",
      value: '3/8" formed crossmembers w/tank mounting holes',
    },
    { label: "Axles", value: "Front + walking tandem rear (8K spindles)" },
    { label: "Suspension", value: "None (Torflex front available)" },
    {
      label: "Tire and Wheel",
      value: "425 used truck tire",
    },
    {
      label: "Hitch",
      value: "Demco retractable tongue w/spring assist",
    },

    { label: "Safety Chains", value: "(2) 3/8 in Grade 70" },
    { label: "Lights", value: "Light Kit Optional" },
    {
      label: "Finish and Paint",
      value: "Bead blasted, acid washed, powder coated",
    },
  ],
  details: [
    "Comes standard with (2) steps on side",
    "Spring assist standard on tongue",
    "Torflex front axle popular",
    '100 or 120" rear axle tracks',
  ],
  keyAdvantages: [
    "Comes standard with (2) steps on side",
    "Spring assist standard on tongue",
    "Torflex front axle popular",
    '100 or 120" rear axle tracks',
  ],
  optionalFeatures: [
    "Hydraulic jacks",
    "Custom deck widths",
    "Winch mounts",
    "Under-deck storage compartments",
  ],
  resources: ["Find a Dealer", "Download Brochure", "Explore Product Options"],
};

export const paverTagTrailer: TrailerProduct = {
  slug: "paver-tag-trailer",
  title: "Paver Tag Trailer",
  shortDescription:
    "Ultra-low profile paver trailer with hydraulic bi-folding ramps and 50,000 lb GVWR.",
  description:
    'Our paver tag line utilizes a 6\' wood beavertail with hydraulic bi-folding ramps to achieve an 8 degree load angle. The trailer typically is set up with (3) 22,500 lb. air brake axles and dual 235/75R 17.5 tires, which provide an ultra-low 34" unloaded deck height. These trailers feature the same one piece fabricated I-beam construction (80 ksi), 4" jr. I-beam x-members (80 ksi) and oak decking, as our other tag trailers.',
  overview:
    "Heavy-duty 50,000 lb GVWR paver trailer featuring a 6' wood beavertail and hydraulic bi-folding ramps for an ultra-low loading angle.",
  heroImage: paverTag1,
  gallery: [paverTag1, paverTag2, paverTag3, paverTag4, paverTag5],
  brochureFileName: "paver-tag-trailer-brochure.pdf",
  specs: [
    { label: "GVWR", value: "50,000 lbs" },
    { label: "Weight", value: "Varies by length" },
    {
      label: "Length",
      value: "25' bed + 6' wood tail w/ hydraulic bi-folding ramps",
    },
    { label: "Width", value: '102"' },
    { label: "Frame", value: "1-Piece Fabricated (80 ksi)" },
    { label: "Unloaded Deck Height", value: '34"' },
    { label: "Side Rails", value: '8" channel' },
    { label: "Crossmembers", value: '4" Jr. I-beams (80 KSI)' },
    { label: "Fenders", value: '1/4" sheet' },
    { label: "Jack", value: "Dual Speed, Semi Style" },
    { label: "Hitch", value: '3" Pintle Eye (90,000 lbs.)' },
    { label: "Safety Chains", value: '(2) 1/2" Gr. 70' },
    { label: "Tie-Downs", value: "1\" Bent D-rings (every 4')" },
    { label: "Storage", value: "Lockable toolbox in tongue" },
    { label: "Axles", value: "(2) Dexter 22,500 lb. air brake axles" },
    { label: "Suspension", value: "Hutch H9700" },
    { label: "Tire and Wheel", value: "235/75R 17.5H dual" },
    { label: "Decking", value: '1 1/2" Rough Oak' },
    { label: "Lights", value: "LED flush mount" },
    { label: "Elect. Plug", value: "Semi Plug" },
    {
      label: "Finish and Paint",
      value: "Bead blasted, acid washed, zinc rich primed, powder coated",
    },
  ],
  details: [
    "20-32' bed length available",
    "Hydraulic bi-folding ramps achieve 7.5° load angle",
    "Air ride or lift axles available",
    "One piece fabricated I-beam construction (80 ksi)",
    "6' wood beavertail for improved traction during loading",
  ],
  keyAdvantages: [
    "Ultra-low 8 degree load angle",
    "50,000 lb high-capacity GVWR",
    "Extreme durability with 80 ksi steel",
    'Low 34" unloaded deck height',
  ],
  optionalFeatures: [
    "Bed lengths from 20' to 32'",
    "Air ride suspension",
    "Lift axles",
    "Custom tie-down configurations",
  ],
  resources: ["Find a Dealer", "Download Brochure", "Product Options"],
};

export const trailers: TrailerProduct[] = [
  directionalDrillTiltTrailer,
  tubeTilt20K,
  paverTagTrailer,
  walkingTandemGooseneckWagon,
];
