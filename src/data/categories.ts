import pvpImg from "@/assets/images/pumps/products/pvp.png";
import pgp505Img from "@/assets/images/pumps/products/pgp505.png";
import f1Img from "@/assets/images/pumps/products/f1.png";
import pgp315Img from "@/assets/images/pumps/products/pgp315.png";

export interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
  subcategories?: Category[];
}

export const productCategories: Category[] = [
  {
    id: "industrial-hydraulic-pumps",
    name: "Industrial Hydraulic Pumps",
    subcategories: [
      {
        id: "industrial-piston-pumps",
        name: "Industrial Piston Pumps",
        description: "Medium-pressure piston pumps for industrial machinery and hydraulic presses.",
        image: pvpImg
      },
      {
        id: "industrial-gear-pumps",
        name: "Industrial Gear Pumps",
        description: "Lightweight and durable gear pumps for automation and material handling.",
        image: pgp505Img
      }
    ]
  },
  {
    id: "mobile-hydraulic-pumps",
    name: "Mobile Hydraulic Pumps",
    subcategories: [
      {
        id: "mobile-piston-pumps",
        name: "Mobile Piston Pumps",
        description: "High-pressure axial piston pumps for mobile and off-road applications.",
        image: f1Img
      },
      {
        id: "mobile-gear-pumps",
        name: "Mobile Gear Pumps",
        description: "Cast iron gear pumps for heavy-duty mobile equipment.",
        image: pgp315Img
      }
    ]
  }
];

export const flattenedCategories = productCategories.flatMap(cat => 
  cat.subcategories ? [cat, ...cat.subcategories] : [cat]
);

export const categoryNames = flattenedCategories.map(cat => cat.name);
