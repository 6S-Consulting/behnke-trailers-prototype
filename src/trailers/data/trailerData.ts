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

import coneImage1 from "@/trailers/SingleConeTrailer/images/Single-Cone-1.jpg";
import coneImage2 from "@/trailers/SingleConeTrailer/images/Single-Cone-2.jpg";
import coneImage3 from "@/trailers/SingleConeTrailer/images/Single-Cone-3.jpg";
import coneImage4 from "@/trailers/SingleConeTrailer/images/Single-Cone-4.jpg";
import coneImage5 from "@/trailers/SingleConeTrailer/images/Single-Cone-5.jpg";
// Using WalkingTandemGooseneckWagon images as placeholders for SingleConeTrailer


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

export const singleConeTrailer: TrailerProduct = {
  slug: "single-cone-trailer",
  title: "Single Cone Trailer",
  shortDescription:
    "Our single cone trailer is designed for an end user who needs a one tank storage solution that will only move the trailer a few times a season.",
  description:
    "Our single cone trailer is designed for an end user who needs a one tank storage solution that will only move the trailer a few times a season.",
  overview:
    "Our single cone trailer is designed for an end user who needs a one tank storage solution that will only move the trailer a few times a season.",
  heroImage: coneImage1,
  gallery: [coneImage1, coneImage2, coneImage3, coneImage4, coneImage5],
  brochureFileName: "single-cone-trailer-brochure.pdf",
  specs: [
    { label: "GVWR", value: "7,000 lbs" },
    { label: "Weight", value: "960 lbs" },
    { label: "Width", value: '92" overall' },
    { label: "Axles", value: "3,500 lb. spindles" },
    { label: "Hitch", value: "Adjustable Clevis" },
    { label: "Frame", value: "Channel" },
    { label: "Lights", value: "Optional LED Safety Lighting" },
    {
      label: "Finish and Paint",
      value: "Bead blasted, acid washed, powder coated",
    },
  ],
  details: [
    "Hand pump for single lift cylinder",
    "Dual cylinders available",
    "Can make to any cone manufacturer's specs."
  ],
  keyAdvantages: [
    "Compact single-cone design for easy maneuverability",
    "Efficient discharge pattern with hydraulic control",
    "Heavy-duty construction rated for continuous use",
    "Low-maintenance design with quality bearings",
    "Compatible with most field spreader receiver systems",
  ],
  optionalFeatures: [
    "Extended coverage hood",
    "Hydraulic spreader drive system",
    "LED lighting package",
    "Stainless steel discharge tube",
    "Custom decals and branding",
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

// Agricultural - Anhydrous Wagons
export const tandemGooseneckWagon: TrailerProduct = {
  slug: "tandem-gooseneck-wagon",
  title: "Tandem Gooseneck Wagon (Twin 1450 gal. Tanks)",
  shortDescription:
    "One of our most popular and versatile models for anhydrous ammonia transport.",
  description:
    "One of our most popular and versatile models, the GN2900WG is built for durability and ease of operation. Twin 1450 gal. tanks for anhydrous ammonia transport with adjustable rear axle track from 92-120 inches.",
  overview:
    "Heavy-duty tandem axle gooseneck wagon designed for agricultural anhydrous ammonia transport with maximum versatility.",
  heroImage: heroImage,
  gallery: [heroImage, trailer03],
  brochureFileName: "tandem-gooseneck-wagon-brochure.pdf",
  specs: [
    { label: "Tank Capacity", value: "Twin 1,450 gal" },
    { label: "GVWR", value: "29,000 lbs" },
    { label: "Axle Config", value: "Tandem" },
    { label: "Hitch", value: "Gooseneck" },
    { label: "Length", value: "24 ft" },
    { label: "Width", value: "102 in" },
    { label: "Track", value: '92-120"  adjustable rear axle' },
  ],
  details: [
    "Comes standard with (2) steps on side",
    "Spring assist standard on tongue",
    "Torflex front axle popular",
    "Popular for agricultural operations",
  ],
  keyAdvantages: [
    "Most popular versatile model",
    "Adjustable rear track width",
    "Heavy-duty construction",
    "Proven reliability",
  ],
  optionalFeatures: [
    "LED light package",
    "Upgraded brakes",
    "Custom configurations",
  ],
  resources: ["Find a Dealer", "Download Brochure", "Request Quote"],
};

// Agricultural - Sprayer Trailers
export const sprayerTrailer40K50K: TrailerProduct = {
  slug: "sprayer-trailer-40k-50k",
  title: "40,000-50,000 lb. Pull-type Sprayer Trailers",
  shortDescription:
    "40,000 to 50,000 lb. GVW pull-type sprayer trailers for agricultural operations.",
  description:
    "Our 40,000 lb. to 50,000 lb. GVW pull-type sprayer trailers are built to handle the heaviest liquid fertilizer loads. Models STX22A and STX22A-EX available with options for longer tongues and heavy-duty fenders.",
  overview:
    "Heavy-duty pull-type sprayer trailers designed for maximum agricultural productivity.",
  heroImage: heroImage,
  gallery: [heroImage, trailer03, trailer04],
  brochureFileName: "sprayer-trailer-40k-50k-brochure.pdf",
  specs: [
    { label: "GVW Rating", value: "40,000-50,000 lb" },
    { label: "Tank Type", value: "Poly" },
    { label: "Boom Width", value: "60-90 ft" },
    { label: "Hitch", value: "Pull-type" },
    { label: "Configuration", value: "Standard or Extended" },
  ],
  details: [
    "Available with longer 10'-14' tongue",
    "HD fenders available",
    "Wood deck in front of outriggers available",
    "Built for precision agricultural application",
  ],
  keyAdvantages: [
    "High capacity payload",
    "Precise spray application",
    "Durable poly tank construction",
    "Field-proven design",
  ],
  optionalFeatures: [
    "Auto-steer ready GPS wiring",
    "Extended tongue",
    "HD fenders",
    "Custom boom configurations",
  ],
  resources: ["Find a Dealer", "Download Brochure", "Dealer Locator"],
};

// Construction - Deckover Gooseneck
export const deckoверGooseneck: TrailerProduct = {
  slug: "deckover-gooseneck",
  title: "Deckover Gooseneck",
  shortDescription:
    "Heavy-duty 8×30 ft deckover with gooseneck hitch for equipment hauling.",
  description:
    "Heavy-duty deckover trailer perfect for equipment hauling. Features 8×30 ft deck with tandem 15K axles and gooseneck hitch configuration.",
  overview:
    "Durable deckover gooseneck trailer for construction equipment transport.",
  heroImage: heroImage,
  gallery: [heroImage, trailer03, trailer04],
  brochureFileName: "deckover-gooseneck-brochure.pdf",
  specs: [
    { label: "Deck", value: "8×30 ft" },
    { label: "Axle", value: "Tandem 15K" },
    { label: "Hitch", value: "Gooseneck" },
    { label: "GVWR", value: "30,000 lb" },
    { label: "Width", value: '102" between fenders' },
  ],
  details: [
    "Heavy-duty construction",
    "Easy loading geometry",
    "Fifth wheel ready",
    "Versatile deck configuration",
  ],
  keyAdvantages: [
    "30,000 lb GVWR capacity",
    "Easy load angles",
    "Durable construction",
    "Professional appearance",
  ],
  optionalFeatures: [
    'Stake pockets every 24"',
    "Extended tongue",
    "Spare tire mounts",
    "Toolbox attachments",
  ],
  resources: ["Find a Dealer", "Download Brochure", "Specifications"],
};

// Heavy Haul - 60-Ton Tag Trailer
export const tagTrailer60Ton: TrailerProduct = {
  slug: "tag-trailer-60-ton",
  title: "Tag Trailer 60-Ton",
  shortDescription:
    "Heavy-duty 60-ton capacity tag trailer for the most demanding equipment hauling.",
  description:
    "60-ton capacity tag trailer with 8×33 ft deck and triple axle configuration. Built from premium materials to handle the heaviest loads with confidence.",
  overview: "Premium 60-ton tag trailer for serious heavy haul requirements.",
  heroImage: heroImage,
  gallery: [heroImage, trailer03, trailer04, trailer05],
  brochureFileName: "tag-trailer-60-ton-brochure.pdf",
  specs: [
    { label: "Capacity", value: "60 ton" },
    { label: "Deck", value: "8×33 ft" },
    { label: "Axle Config", value: "Triple" },
    { label: "GVWR", value: "120,000 lb" },
    { label: "Suspension", value: "Air ride standard" },
  ],
  details: [
    "Built for the toughest loads",
    "Drop deck option available",
    "Customizable for specific loads",
    "Industry-leading durability",
  ],
  keyAdvantages: [
    "60-ton payload capacity",
    "Triple axle for distribution",
    "Air ride comfort and control",
    "Proven reliability",
  ],
  optionalFeatures: [
    "Air ride suspension",
    "Flip axle configuration",
    "Custom swingout",
    "Load sensors",
  ],
  resources: ["Find a Dealer", "Download Brochure", "Request Customization"],
};

// Utility/Telecom - Directional Drill Ramp Trailer
export const directionalDrillRampTrailer: TrailerProduct = {
  slug: "directional-drill-ramp-trailer",
  title: "Directional Drill Ramp Trailer",
  shortDescription:
    "Complete directional drill ready system with ramps and mounts for boring equipment.",
  description:
    "Directional drill ramp trailers are available in 18', 20', and 24' models with HD 23\" wide tube ramps and complete boring equipment mounts.",
  overview:
    "Purpose-built trailer system for directional drilling equipment with integrated ramps and mounting solutions.",
  heroImage: heroImage,
  gallery: [heroImage, trailer03, trailer04],
  brochureFileName: "directional-drill-ramp-brochure.pdf",
  specs: [
    { label: "Models", value: "18', 20', 24'" },
    { label: "Ramp Width", value: 'HD 23" tube' },
    { label: "GVWR", value: "20,000-24,000 lb" },
    { label: "Deck Height", value: "Industry low on spring suspension" },
    { label: "Customization", value: "Full dealer-specific options" },
  ],
  details: [
    'HD 23" wide tube ramps w/pin style lock',
    "Completely drill ready with mixer, reel, and toolbox mounts",
    "Boring rod holders and machine stops",
    "Trailer can be customized to meet dealer mounting specs",
    "Custom tongue, deck, and beavertail lengths available",
  ],
  keyAdvantages: [
    "Fully integrated drilling system",
    "Low deck for safe loading",
    "Heavy-duty ramp construction",
    "Custom support for all major manufacturers",
  ],
  optionalFeatures: [
    "Mixer mount",
    "Reel mount",
    "Toolbox integration",
    "Rod holder systems",
  ],
  resources: ["Find a Dealer", "Download Brochure", "Configure Drill Setup"],
};

// Commercial - OTR Step Deck Semi
export const otrStepDeckSemi: TrailerProduct = {
  slug: "otr-step-deck-semi",
  title: "Over the Road Step-Deck Semi Trailer",
  shortDescription:
    "53-foot over-the-road step deck trailer for commercial freight hauling.",
  description:
    "Professional step deck semi trailer designed for over-the-road freight hauling. Available in multiple profiles and configurations with premium components for maximum payload and durability.",
  overview:
    "Commercial-grade step deck semi trailer engineered for heavy freight applications.",
  heroImage: heroImage,
  gallery: [heroImage, trailer03, trailer04],
  brochureFileName: "otr-step-deck-brochure.pdf",
  specs: [
    { label: "Length", value: "40' - 53'" },
    { label: "Upper Deck", value: "11 ft" },
    { label: "Lower Deck", value: "42 ft" },
    { label: "GVWR", value: "80,000 lb" },
    { label: "Decking", value: "Oak or Apitong hardwood" },
  ],
  details: [
    "Various overall lengths available from 40' - 53'",
    "Air ride suspension and lightweight hardwood decking standard",
    "Option to add a 6' beavertail w/ load ramps",
    "Triple axle configurations available",
    "Low profile option for maximum payload",
  ],
  keyAdvantages: [
    "Maximum payload capacity",
    "Low-profile for high-clearance routes",
    "Premium hardwood decking",
    "Fuel-efficient air ride suspension",
  ],
  optionalFeatures: [
    "Beavertail and ramps",
    "Triple axle configuration",
    "Lift axles",
    "Winch tracks",
  ],
  resources: ["Find a Dealer", "Download Brochure", "Freight Solutions"],
};

// Utility/Telecom - Pole Trailer
export const poleTrailer: TrailerProduct = {
  slug: "pole-trailer",
  title: "Pole Trailer 60'",
  shortDescription:
    "Extendable pole trailer for utility poles and long materials transport.",
  description:
    "60-foot extendable pole trailer designed for utility companies. Features multiple bolsters and extends to accommodate poles up to 60 feet in length.",
  overview:
    "Specialized trailer for utility pole and infrastructure material transport.",
  heroImage: heroImage,
  gallery: [heroImage, trailer03],
  brochureFileName: "pole-trailer-brochure.pdf",
  specs: [
    { label: "Reach", value: "45-60 ft" },
    { label: "Bolsters", value: "2" },
    { label: "GVWR", value: "50,000 lb" },
    { label: "Hitch", value: "Draw bar" },
    { label: "Load Height", value: "Adjustable" },
  ],
  details: [
    "Telescoping design for different pole lengths",
    "Manual or powered extension options",
    "Load-holding binders included",
    "Built for utility and telecom industries",
  ],
  keyAdvantages: [
    "Up to 60' reach",
    "Flexible load positioning",
    "Proven utility-industry design",
    "Easy load securement",
  ],
  optionalFeatures: [
    "Powered hydraulic extending",
    "Additional bolster options",
    "Custom binder configuration",
  ],
  resources: ["Find a Dealer", "Download Brochure", "Utility Solutions"],
};

// Utility/Telecom - Reel Trailer
export const reelTrailer: TrailerProduct = {
  slug: "reel-trailer",
  title: "Reel Trailer Heavy Duty",
  shortDescription:
    "Heavy-duty cable reel trailer for telecom and power line applications.",
  description:
    "Heavy-duty reel trailer designed to transport cable reels safely. Features hydraulic spindles and is purpose-built for telecom and power utilities.",
  overview:
    "Industrial reel trailer for telecommunications and utility cable transport.",
  heroImage: heroImage,
  gallery: [heroImage, trailer03],
  brochureFileName: "reel-trailer-brochure.pdf",
  specs: [
    { label: "Reel Capacity", value: "3 reels" },
    { label: "Spindles", value: "Hydraulic" },
    { label: "GVWR", value: "41,000 lb" },
    { label: "Hitch", value: "Draw bar" },
    { label: "Brakes", value: "Air brakes" },
  ],
  details: [
    "Hydraulic spindle system for smooth operation",
    "Dual spindle saddles with load distribution",
    "Heavy-duty frame construction",
    "Integrated cable guides",
  ],
  keyAdvantages: [
    "3-reel capacity",
    "Hydraulic load distribution",
    "Heavy-duty construction",
    "Industry-standard design",
  ],
  optionalFeatures: [
    "Electric/hydraulic combination",
    "Load monitoring sensors",
    "Cable guides and protective padding",
  ],
  resources: ["Find a Dealer", "Download Brochure", "Telecom Specialists"],
};

// Construction - Low-Pro HD Dump
export const dumpTrailer: TrailerProduct = {
  slug: "low-pro-hd-dump",
  title: "Low-Pro HD Dump 20K",
  shortDescription:
    "Hydraulic low-profile dump trailer for construction materials.",
  description:
    "20,000 lb GVWR hydraulic dump trailer with champion scissors hoist and MTE hydraulic unit. Available in 14', 16' or 18' lengths with customizable side heights.",
  overview:
    "Heavy-duty low-profile dump trailer for construction and bulk material transport.",
  heroImage: heroImage,
  gallery: [heroImage, trailer03],
  brochureFileName: "dump-trailer-brochure.pdf",
  specs: [
    { label: "GVWR", value: "20,000 lb" },
    { label: "Bed Length", value: "14', 16' or 18'" },
    { label: "Sides", value: "2-3' adjustable" },
    { label: "Hitch", value: "Pull-type or Gooseneck" },
    { label: "Hoist", value: 'Champion scissors hoist w/ 6" cylinder' },
  ],
  details: [
    'Champion Scissors Hoist w/ 6" cylinder',
    "MTE hydraulic unit for raising/lowering",
    "3-way combination gate",
    "Available in 14', 16' or 18' lengths w/2-3' sides",
    "Gooseneck coupler available",
  ],
  keyAdvantages: [
    "Low-profile design",
    "Quick hydraulic raise/lower",
    "Heavy-duty steel construction",
    "Versatile bed length options",
  ],
  optionalFeatures: [
    "Gooseneck hitch",
    "Extended sides",
    "Tarp system",
    "LED lighting package",
  ],
  resources: ["Find a Dealer", "Download Brochure", "Construction Solutions"],
};

export const trailers: TrailerProduct[] = [
  directionalDrillTiltTrailer,
  tubeTilt20K,
  paverTagTrailer,
  walkingTandemGooseneckWagon,
  singleConeTrailer,
  tandemGooseneckWagon,
  sprayerTrailer40K50K,
  deckoверGooseneck,
  tagTrailer60Ton,
  directionalDrillRampTrailer,
  otrStepDeckSemi,
  poleTrailer,
  reelTrailer,
  dumpTrailer,
];
