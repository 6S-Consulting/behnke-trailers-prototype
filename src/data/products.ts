import f1Img from "@/assets/images/pumps/products/f1.png";
import f2Img from "@/assets/images/pumps/products/f2.png";
import f3Img from "@/assets/images/pumps/products/f3.png";
import goldCupImg from "@/assets/images/pumps/products/gold_cup.png";
import oildyneImg from "@/assets/images/pumps/products/oildyne.png";
import pdImg from "@/assets/images/pumps/products/pd.png";
import pgp315Img from "@/assets/images/pumps/products/pgp315.png";
import pgp330Img from "@/assets/images/pumps/products/pgp330.png";
import pgp350Img from "@/assets/images/pumps/products/pgp350.png";
import pgp365Img from "@/assets/images/pumps/products/pgp365.png";
import pgp505Img from "@/assets/images/pumps/products/pgp505.png";
import pgp511Img from "@/assets/images/pumps/products/pgp511.png";
import pvpImg from "@/assets/images/pumps/products/pvp.png";

export type PumpCategory =
  | "Industrial Piston Pumps"
  | "Industrial Gear Pumps"
  | "Mobile Piston Pumps"
  | "Mobile Gear Pumps";

export const PUMP_CATEGORIES: PumpCategory[] = [
  "Industrial Piston Pumps",
  "Industrial Gear Pumps",
  "Mobile Piston Pumps",
  "Mobile Gear Pumps",
];

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  baseCost: number;
  stock: number;
  inStock: boolean;
  status: 'active' | 'draft';

  primaryImage: string;
  secondaryImage: string;
  image: string;
  gallery?: string[];

  description: string;
  specs: {
    displacement: string;
    maxPressure: string;
    maxSpeed: string;
    mounting: string;
    shaftType?: string;
    porting?: string;
    boreSize?: string;
    stroke?: string;
    rodDiameter?: string;
  };
  features?: string[];
  stockStatus: 'In Stock' | 'Out of Stock';
  groupId?: string;

  isBestSeller?: boolean;
  isFeatured?: boolean;
  discountPercentage?: number;
  collections: string[];
  createdAt: string;
  updatedAt: string;

  // Admin-only extended fields
  bulkPricingNote?: string;
  specifications?: {
    displacement?: string;
    maxPressure?: string;
    maxSpeed?: string;
    mountingType?: string;
    shaftType?: string;
    portType?: string;
  };
}

export const categories = [
  "All",
  "Industrial Piston Pumps",
  "Industrial Gear Pumps",
  "Mobile Piston Pumps",
  "Mobile Gear Pumps"
];

export const products: Product[] = [
  // 1.1 Industrial Piston Pumps - PVP Series
  {
    id: "PVP16", sku: "PVP16", name: "PVP16 Hydraulic Piston Pump", category: "Industrial Piston Pumps",
    price: 510, baseCost: 310, stock: 45, inStock: true, status: "active", primaryImage: pvpImg, secondaryImage: pvpImg, image: pvpImg,
    description: "PVP16 Industrial Piston Pump.", specs: { displacement: "16 cc/rev", maxPressure: "3600 PSI", maxSpeed: "1800 RPM", mounting: "SAE B 2-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pvp-series", isBestSeller: true, discountPercentage: 15
  },
  {
    id: "PVP23", sku: "PVP23", name: "PVP23 Hydraulic Piston Pump", category: "Industrial Piston Pumps",
    price: 620, baseCost: 380, stock: 35, inStock: true, status: "active", primaryImage: pvpImg, secondaryImage: pvpImg, image: pvpImg,
    description: "PVP23 Industrial Piston Pump.", specs: { displacement: "23 cc/rev", maxPressure: "3600 PSI", maxSpeed: "1800 RPM", mounting: "SAE B 2-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pvp-series", isBestSeller: true
  },
  {
    id: "PVP33", sku: "PVP33", name: "PVP33 Hydraulic Piston Pump", category: "Industrial Piston Pumps",
    price: 750, baseCost: 450, stock: 25, inStock: true, status: "active", primaryImage: pvpImg, secondaryImage: pvpImg, image: pvpImg,
    description: "PVP33 Industrial Piston Pump.", specs: { displacement: "33 cc/rev", maxPressure: "3600 PSI", maxSpeed: "1800 RPM", mounting: "SAE B 2-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pvp-series"
  },
  {
    id: "PVP41", sku: "PVP41", name: "PVP41 Hydraulic Piston Pump", category: "Industrial Piston Pumps",
    price: 880, baseCost: 530, stock: 15, inStock: true, status: "active", primaryImage: pvpImg, secondaryImage: pvpImg, image: pvpImg,
    description: "PVP41 Industrial Piston Pump.", specs: { displacement: "41 cc/rev", maxPressure: "4000 PSI", maxSpeed: "1800 RPM", mounting: "SAE C 4-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pvp-series"
  },
  {
    id: "PVP48", sku: "PVP48", name: "PVP48 Hydraulic Piston Pump", category: "Industrial Piston Pumps",
    price: 990, baseCost: 600, stock: 10, inStock: true, status: "active", primaryImage: pvpImg, secondaryImage: pvpImg, image: pvpImg,
    description: "PVP48 Industrial Piston Pump.", specs: { displacement: "48 cc/rev", maxPressure: "4000 PSI", maxSpeed: "1800 RPM", mounting: "SAE C 4-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pvp-series"
  },
  // PD Series
  {
    id: "PD018", sku: "PD018", name: "PD018 Hydraulic Piston Pump", category: "Industrial Piston Pumps",
    price: 690, baseCost: 420, stock: 20, inStock: true, status: "active", primaryImage: pdImg, secondaryImage: pdImg, image: pdImg,
    description: "PD018 Industrial Piston Pump.", specs: { displacement: "18 cc/rev", maxPressure: "4000 PSI", maxSpeed: "1800 RPM", mounting: "SAE C 4-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pd-series", isBestSeller: true, discountPercentage: 10
  },
  {
    id: "PD028", sku: "PD028", name: "PD028 Hydraulic Piston Pump", category: "Industrial Piston Pumps",
    price: 840, baseCost: 510, stock: 18, inStock: true, status: "active", primaryImage: pdImg, secondaryImage: pdImg, image: pdImg,
    description: "PD028 Industrial Piston Pump.", specs: { displacement: "28 cc/rev", maxPressure: "4000 PSI", maxSpeed: "1800 RPM", mounting: "SAE C 4-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pd-series"
  },
  {
    id: "PD045", sku: "PD045", name: "PD045 Hydraulic Piston Pump", category: "Industrial Piston Pumps",
    price: 1050, baseCost: 640, stock: 12, inStock: true, status: "active", primaryImage: pdImg, secondaryImage: pdImg, image: pdImg,
    description: "PD045 Industrial Piston Pump.", specs: { displacement: "45 cc/rev", maxPressure: "4000 PSI", maxSpeed: "1800 RPM", mounting: "SAE C 4-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pd-series"
  },
  {
    id: "PD075", sku: "PD075", name: "PD075 Hydraulic Piston Pump", category: "Industrial Piston Pumps",
    price: 1320, baseCost: 800, stock: 8, inStock: true, status: "active", primaryImage: pdImg, secondaryImage: pdImg, image: pdImg,
    description: "PD075 Industrial Piston Pump.", specs: { displacement: "75 cc/rev", maxPressure: "4000 PSI", maxSpeed: "1500 RPM", mounting: "SAE D 4-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pd-series"
  },
  // Oildyne Series
  {
    id: "OILDM", sku: "OILDM", name: "Oildyne M Series Mini Pump", category: "Industrial Piston Pumps",
    price: 295, baseCost: 180, stock: 50, inStock: true, status: "active", primaryImage: oildyneImg, secondaryImage: oildyneImg, image: oildyneImg,
    description: "OILDM Miniature Piston Pump.", specs: { displacement: "0.5 cc/rev", maxPressure: "3000 PSI", maxSpeed: "5000 RPM", mounting: "Manifold" },
    stockStatus: "In Stock", collections: ["industrial-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "oildyne", isBestSeller: true, discountPercentage: 5
  },
  {
    id: "OIL108", sku: "OIL108", name: "Oildyne 108 Series Pump", category: "Industrial Piston Pumps",
    price: 350, baseCost: 210, stock: 40, inStock: true, status: "active", primaryImage: oildyneImg, secondaryImage: oildyneImg, image: oildyneImg,
    description: "OIL108 Series Pump.", specs: { displacement: "1.0 cc/rev", maxPressure: "3000 PSI", maxSpeed: "4000 RPM", mounting: "Manifold" },
    stockStatus: "In Stock", collections: ["industrial-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "oildyne"
  },
  {
    id: "OIL300", sku: "OIL300", name: "Oildyne 300 Series Pump", category: "Industrial Piston Pumps",
    price: 450, baseCost: 270, stock: 30, inStock: true, status: "active", primaryImage: oildyneImg, secondaryImage: oildyneImg, image: oildyneImg,
    description: "OIL300 Series Pump.", specs: { displacement: "3.0 cc/rev", maxPressure: "3500 PSI", maxSpeed: "3000 RPM", mounting: "Manifold" },
    stockStatus: "In Stock", collections: ["industrial-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "oildyne"
  },
  {
    id: "OIL500", sku: "OIL500", name: "Oildyne 500 Series Pump", category: "Industrial Piston Pumps",
    price: 550, baseCost: 330, stock: 20, inStock: true, status: "active", primaryImage: oildyneImg, secondaryImage: oildyneImg, image: oildyneImg,
    description: "OIL500 Series Pump.", specs: { displacement: "5.0 cc/rev", maxPressure: "3500 PSI", maxSpeed: "2500 RPM", mounting: "Manifold" },
    stockStatus: "In Stock", collections: ["industrial-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "oildyne"
  },
  // 1.2 Industrial Gear Pumps - PGP505
  {
    id: "505A", sku: "505A", name: "PGP505A Hydraulic Gear Pump", category: "Industrial Gear Pumps",
    price: 245, baseCost: 150, stock: 100, inStock: true, status: "active", primaryImage: pgp505Img, secondaryImage: pgp505Img, image: pgp505Img,
    description: "PGP505A Gear Pump.", specs: { displacement: "2 cc/rev", maxPressure: "3000 PSI", maxSpeed: "3500 RPM", mounting: "SAE A 2-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp505", isBestSeller: true, discountPercentage: 20
  },
  {
    id: "505B", sku: "505B", name: "PGP505B Hydraulic Gear Pump", category: "Industrial Gear Pumps",
    price: 265, baseCost: 160, stock: 90, inStock: true, status: "active", primaryImage: pgp505Img, secondaryImage: pgp505Img, image: pgp505Img,
    description: "PGP505B Gear Pump.", specs: { displacement: "4 cc/rev", maxPressure: "3000 PSI", maxSpeed: "3500 RPM", mounting: "SAE A 2-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp505"
  },
  {
    id: "505C", sku: "505C", name: "PGP505C Hydraulic Gear Pump", category: "Industrial Gear Pumps",
    price: 285, baseCost: 175, stock: 80, inStock: true, status: "active", primaryImage: pgp505Img, secondaryImage: pgp505Img, image: pgp505Img,
    description: "PGP505C Gear Pump.", specs: { displacement: "6 cc/rev", maxPressure: "3000 PSI", maxSpeed: "3500 RPM", mounting: "SAE A 2-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp505"
  },
  {
    id: "505D", sku: "505D", name: "PGP505D Hydraulic Gear Pump", category: "Industrial Gear Pumps",
    price: 310, baseCost: 190, stock: 70, inStock: true, status: "active", primaryImage: pgp505Img, secondaryImage: pgp505Img, image: pgp505Img,
    description: "PGP505D Gear Pump.", specs: { displacement: "8 cc/rev", maxPressure: "3000 PSI", maxSpeed: "3500 RPM", mounting: "SAE A 2-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp505"
  },
  // PGP511
  {
    id: "511A", sku: "511A", name: "PGP511A Hydraulic Gear Pump", category: "Industrial Gear Pumps",
    price: 340, baseCost: 210, stock: 60, inStock: true, status: "active", primaryImage: pgp511Img, secondaryImage: pgp511Img, image: pgp511Img,
    description: "PGP511A Gear Pump.", specs: { displacement: "10 cc/rev", maxPressure: "3000 PSI", maxSpeed: "3000 RPM", mounting: "SAE A 2-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp511", isBestSeller: true
  },
  {
    id: "511B", sku: "511B", name: "PGP511B Hydraulic Gear Pump", category: "Industrial Gear Pumps",
    price: 360, baseCost: 220, stock: 55, inStock: true, status: "active", primaryImage: pgp511Img, secondaryImage: pgp511Img, image: pgp511Img,
    description: "PGP511B Gear Pump.", specs: { displacement: "12 cc/rev", maxPressure: "3000 PSI", maxSpeed: "3000 RPM", mounting: "SAE A 2-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp511"
  },
  {
    id: "511C", sku: "511C", name: "PGP511C Hydraulic Gear Pump", category: "Industrial Gear Pumps",
    price: 380, baseCost: 235, stock: 50, inStock: true, status: "active", primaryImage: pgp511Img, secondaryImage: pgp511Img, image: pgp511Img,
    description: "PGP511C Gear Pump.", specs: { displacement: "14 cc/rev", maxPressure: "3000 PSI", maxSpeed: "3000 RPM", mounting: "SAE A 2-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp511"
  },
  {
    id: "511D", sku: "511D", name: "PGP511D Hydraulic Gear Pump", category: "Industrial Gear Pumps",
    price: 410, baseCost: 250, stock: 45, inStock: true, status: "active", primaryImage: pgp511Img, secondaryImage: pgp511Img, image: pgp511Img,
    description: "PGP511D Gear Pump.", specs: { displacement: "16 cc/rev", maxPressure: "3000 PSI", maxSpeed: "3000 RPM", mounting: "SAE A 2-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp511"
  },
  // 2.1 Mobile Piston Pumps - F1 Series
  {
    id: "F112", sku: "F112", name: "F1-12 Hydraulic Pump", category: "Mobile Piston Pumps",
    price: 980, baseCost: 600, stock: 25, inStock: true, status: "active", primaryImage: f1Img, secondaryImage: f1Img, image: f1Img,
    description: "F1-12 Mobile Pump.", specs: { displacement: "12 cc/rev", maxPressure: "5000 PSI", maxSpeed: "2300 RPM", mounting: "DIN 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "f1-series", isBestSeller: true, discountPercentage: 12
  },
  {
    id: "F125", sku: "F125", name: "F1-25 Hydraulic Pump", category: "Mobile Piston Pumps",
    price: 1150, baseCost: 700, stock: 20, inStock: true, status: "active", primaryImage: f1Img, secondaryImage: f1Img, image: f1Img,
    description: "F1-25 Mobile Pump.", specs: { displacement: "25 cc/rev", maxPressure: "5000 PSI", maxSpeed: "2300 RPM", mounting: "DIN 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "f1-series"
  },
  {
    id: "F141", sku: "F141", name: "F1-41 Hydraulic Pump", category: "Mobile Piston Pumps",
    price: 1350, baseCost: 820, stock: 15, inStock: true, status: "active", primaryImage: f1Img, secondaryImage: f1Img, image: f1Img,
    description: "F1-41 Mobile Pump.", specs: { displacement: "41 cc/rev", maxPressure: "5000 PSI", maxSpeed: "2000 RPM", mounting: "DIN 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "f1-series"
  },
  {
    id: "F161", sku: "F161", name: "F1-61 Hydraulic Pump", category: "Mobile Piston Pumps",
    price: 1550, baseCost: 950, stock: 10, inStock: true, status: "active", primaryImage: f1Img, secondaryImage: f1Img, image: f1Img,
    description: "F1-61 Mobile Pump.", specs: { displacement: "61 cc/rev", maxPressure: "5000 PSI", maxSpeed: "1800 RPM", mounting: "DIN 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "f1-series"
  },
  {
    id: "F181", sku: "F181", name: "F1-81 Hydraulic Pump", category: "Mobile Piston Pumps",
    price: 1780, baseCost: 1100, stock: 5, inStock: true, status: "active", primaryImage: f1Img, secondaryImage: f1Img, image: f1Img,
    description: "F1-81 Mobile Pump.", specs: { displacement: "81 cc/rev", maxPressure: "5000 PSI", maxSpeed: "1500 RPM", mounting: "DIN 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "f1-series"
  },
  // F2 Series
  {
    id: "F225", sku: "F225", name: "F2-25 Twin Flow Pump", category: "Mobile Piston Pumps",
    price: 1550, baseCost: 950, stock: 12, inStock: true, status: "active", primaryImage: f2Img, secondaryImage: f2Img, image: f2Img,
    description: "F2-25 Twin Flow Pump.", specs: { displacement: "25+25 cc/rev", maxPressure: "5000 PSI", maxSpeed: "2100 RPM", mounting: "DIN 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "f2-series", isBestSeller: true
  },
  {
    id: "F240", sku: "F240", name: "F2-40 Twin Flow Pump", category: "Mobile Piston Pumps",
    price: 1750, baseCost: 1050, stock: 8, inStock: true, status: "active", primaryImage: f2Img, secondaryImage: f2Img, image: f2Img,
    description: "F2-40 Twin Flow Pump.", specs: { displacement: "40+40 cc/rev", maxPressure: "5000 PSI", maxSpeed: "2100 RPM", mounting: "DIN 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "f2-series"
  },
  {
    id: "F255", sku: "F255", name: "F2-55 Twin Flow Pump", category: "Mobile Piston Pumps",
    price: 1950, baseCost: 1200, stock: 5, inStock: true, status: "active", primaryImage: f2Img, secondaryImage: f2Img, image: f2Img,
    description: "F2-55 Twin Flow Pump.", specs: { displacement: "55+55 cc/rev", maxPressure: "5000 PSI", maxSpeed: "2100 RPM", mounting: "DIN 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "f2-series"
  },
  {
    id: "F270", sku: "F270", name: "F2-70 Twin Flow Pump", category: "Mobile Piston Pumps",
    price: 2150, baseCost: 1300, stock: 3, inStock: true, status: "active", primaryImage: f2Img, secondaryImage: f2Img, image: f2Img,
    description: "F2-70 Twin Flow Pump.", specs: { displacement: "70+70 cc/rev", maxPressure: "5000 PSI", maxSpeed: "2100 RPM", mounting: "DIN 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "f2-series"
  },
  // F3 Series
  {
    id: "F325", sku: "F325", name: "F3-25 Hydraulic Pump", category: "Mobile Piston Pumps",
    price: 1250, baseCost: 750, stock: 15, inStock: true, status: "active", primaryImage: f3Img, secondaryImage: f3Img, image: f3Img,
    description: "F3-25 Mobile Pump.", specs: { displacement: "25 cc/rev", maxPressure: "5000 PSI", maxSpeed: "2300 RPM", mounting: "DIN 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "f3-series"
  },
  {
    id: "F340", sku: "F340", name: "F3-40 Hydraulic Pump", category: "Mobile Piston Pumps",
    price: 1450, baseCost: 880, stock: 12, inStock: true, status: "active", primaryImage: f3Img, secondaryImage: f3Img, image: f3Img,
    description: "F3-40 Mobile Pump.", specs: { displacement: "40 cc/rev", maxPressure: "5000 PSI", maxSpeed: "2300 RPM", mounting: "DIN 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "f3-series"
  },
  {
    id: "F355", sku: "F355", name: "F3-55 Hydraulic Pump", category: "Mobile Piston Pumps",
    price: 1650, baseCost: 1000, stock: 10, inStock: true, status: "active", primaryImage: f3Img, secondaryImage: f3Img, image: f3Img,
    description: "F3-55 Mobile Pump.", specs: { displacement: "55 cc/rev", maxPressure: "5000 PSI", maxSpeed: "2300 RPM", mounting: "DIN 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "f3-series"
  },
  {
    id: "F370", sku: "F370", name: "F3-70 Hydraulic Pump", category: "Mobile Piston Pumps",
    price: 1850, baseCost: 1120, stock: 8, inStock: true, status: "active", primaryImage: f3Img, secondaryImage: f3Img, image: f3Img,
    description: "F3-70 Mobile Pump.", specs: { displacement: "70 cc/rev", maxPressure: "5000 PSI", maxSpeed: "2300 RPM", mounting: "DIN 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "f3-series"
  },
  // Gold Cup Series
  {
    id: "GCP6", sku: "GCP6", name: "P6 Gold Cup Pump", category: "Mobile Piston Pumps",
    price: 3200, baseCost: 1950, stock: 5, inStock: true, status: "active", primaryImage: goldCupImg, secondaryImage: goldCupImg, image: goldCupImg,
    description: "P6 Gold Cup Series.", specs: { displacement: "100 cc/rev", maxPressure: "6000 PSI", maxSpeed: "3000 RPM", mounting: "SAE D 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "gold-cup", isBestSeller: true, discountPercentage: 25
  },
  {
    id: "GCP7", sku: "GCP7", name: "P7 Gold Cup Pump", category: "Mobile Piston Pumps",
    price: 3500, baseCost: 2150, stock: 4, inStock: true, status: "active", primaryImage: goldCupImg, secondaryImage: goldCupImg, image: goldCupImg,
    description: "P7 Gold Cup Series.", specs: { displacement: "115 cc/rev", maxPressure: "6000 PSI", maxSpeed: "2800 RPM", mounting: "SAE D 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "gold-cup"
  },
  {
    id: "GCP8", sku: "GCP8", name: "P8 Gold Cup Pump", category: "Mobile Piston Pumps",
    price: 3800, baseCost: 2350, stock: 3, inStock: true, status: "active", primaryImage: goldCupImg, secondaryImage: goldCupImg, image: goldCupImg,
    description: "P8 Gold Cup Series.", specs: { displacement: "135 cc/rev", maxPressure: "6000 PSI", maxSpeed: "2600 RPM", mounting: "SAE D 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "gold-cup"
  },
  {
    id: "GCP11", sku: "GCP11", name: "P11 Gold Cup Pump", category: "Mobile Piston Pumps",
    price: 4500, baseCost: 2750, stock: 2, inStock: true, status: "active", primaryImage: goldCupImg, secondaryImage: goldCupImg, image: goldCupImg,
    description: "P11 Gold Cup Series.", specs: { displacement: "180 cc/rev", maxPressure: "6000 PSI", maxSpeed: "2400 RPM", mounting: "SAE E 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "gold-cup"
  },
  {
    id: "GCP14", sku: "GCP14", name: "P14 Gold Cup Pump", category: "Mobile Piston Pumps",
    price: 5200, baseCost: 3200, stock: 2, inStock: true, status: "active", primaryImage: goldCupImg, secondaryImage: goldCupImg, image: goldCupImg,
    description: "P14 Gold Cup Series.", specs: { displacement: "225 cc/rev", maxPressure: "6000 PSI", maxSpeed: "2200 RPM", mounting: "SAE E 4-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-piston-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "gold-cup"
  },
  // 2.2 Mobile Gear Pumps - PGP315
  {
    id: "315A", sku: "315A", name: "PGP315A Gear Pump", category: "Mobile Gear Pumps",
    price: 315, baseCost: 195, stock: 80, inStock: true, status: "active", primaryImage: pgp315Img, secondaryImage: pgp315Img, image: pgp315Img,
    description: "PGP315A Mobile Gear Pump.", specs: { displacement: "20 cc/rev", maxPressure: "3500 PSI", maxSpeed: "3000 RPM", mounting: "SAE B 2-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp315", isBestSeller: true, discountPercentage: 15
  },
  {
    id: "315B", sku: "315B", name: "PGP315B Gear Pump", category: "Mobile Gear Pumps",
    price: 335, baseCost: 205, stock: 75, inStock: true, status: "active", primaryImage: pgp315Img, secondaryImage: pgp315Img, image: pgp315Img,
    description: "PGP315B Mobile Gear Pump.", specs: { displacement: "25 cc/rev", maxPressure: "3500 PSI", maxSpeed: "3000 RPM", mounting: "SAE B 2-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp315"
  },
  {
    id: "315C", sku: "315C", name: "PGP315C Gear Pump", category: "Mobile Gear Pumps",
    price: 355, baseCost: 215, stock: 70, inStock: true, status: "active", primaryImage: pgp315Img, secondaryImage: pgp315Img, image: pgp315Img,
    description: "PGP315C Mobile Gear Pump.", specs: { displacement: "30 cc/rev", maxPressure: "3500 PSI", maxSpeed: "3000 RPM", mounting: "SAE B 2-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp315"
  },
  // PGP330
  {
    id: "330A", sku: "330A", name: "PGP330A Gear Pump", category: "Mobile Gear Pumps",
    price: 380, baseCost: 230, stock: 65, inStock: true, status: "active", primaryImage: pgp330Img, secondaryImage: pgp330Img, image: pgp330Img,
    description: "PGP330A Mobile Gear Pump.", specs: { displacement: "40 cc/rev", maxPressure: "3500 PSI", maxSpeed: "2800 RPM", mounting: "SAE B 2-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp330", discountPercentage: 10
  },
  {
    id: "330B", sku: "330B", name: "PGP330B Gear Pump", category: "Mobile Gear Pumps",
    price: 400, baseCost: 245, stock: 60, inStock: true, status: "active", primaryImage: pgp330Img, secondaryImage: pgp330Img, image: pgp330Img,
    description: "PGP330B Mobile Gear Pump.", specs: { displacement: "45 cc/rev", maxPressure: "3500 PSI", maxSpeed: "2800 RPM", mounting: "SAE B 2-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp330"
  },
  {
    id: "330C", sku: "330C", name: "PGP330C Gear Pump", category: "Mobile Gear Pumps",
    price: 420, baseCost: 260, stock: 55, inStock: true, status: "active", primaryImage: pgp330Img, secondaryImage: pgp330Img, image: pgp330Img,
    description: "PGP330C Mobile Gear Pump.", specs: { displacement: "50 cc/rev", maxPressure: "3500 PSI", maxSpeed: "2800 RPM", mounting: "SAE B 2-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp330"
  },
  // PGP350
  {
    id: "350A", sku: "350A", name: "PGP350A Gear Pump", category: "Mobile Gear Pumps",
    price: 450, baseCost: 275, stock: 50, inStock: true, status: "active", primaryImage: pgp350Img, secondaryImage: pgp350Img, image: pgp350Img,
    description: "PGP350A Mobile Gear Pump.", specs: { displacement: "60 cc/rev", maxPressure: "3500 PSI", maxSpeed: "2500 RPM", mounting: "SAE C 2-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp350"
  },
  {
    id: "350B", sku: "350B", name: "PGP350B Gear Pump", category: "Mobile Gear Pumps",
    price: 475, baseCost: 290, stock: 45, inStock: true, status: "active", primaryImage: pgp350Img, secondaryImage: pgp350Img, image: pgp350Img,
    description: "PGP350B Mobile Gear Pump.", specs: { displacement: "65 cc/rev", maxPressure: "3500 PSI", maxSpeed: "2500 RPM", mounting: "SAE C 2-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp350"
  },
  {
    id: "350C", sku: "350C", name: "PGP350C Gear Pump", category: "Mobile Gear Pumps",
    price: 500, baseCost: 305, stock: 40, inStock: true, status: "active", primaryImage: pgp350Img, secondaryImage: pgp350Img, image: pgp350Img,
    description: "PGP350C Mobile Gear Pump.", specs: { displacement: "70 cc/rev", maxPressure: "3500 PSI", maxSpeed: "2500 RPM", mounting: "SAE C 2-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp350"
  },
  // PGP365
  {
    id: "365A", sku: "365A", name: "PGP365A Gear Pump", category: "Mobile Gear Pumps",
    price: 550, baseCost: 335, stock: 35, inStock: true, status: "active", primaryImage: pgp365Img, secondaryImage: pgp365Img, image: pgp365Img,
    description: "PGP365A Mobile Gear Pump.", specs: { displacement: "80 cc/rev", maxPressure: "3500 PSI", maxSpeed: "2200 RPM", mounting: "SAE C 2-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp365"
  },
  {
    id: "365B", sku: "365B", name: "PGP365B Gear Pump", category: "Mobile Gear Pumps",
    price: 580, baseCost: 350, stock: 30, inStock: true, status: "active", primaryImage: pgp365Img, secondaryImage: pgp365Img, image: pgp365Img,
    description: "PGP365B Mobile Gear Pump.", specs: { displacement: "90 cc/rev", maxPressure: "3500 PSI", maxSpeed: "2200 RPM", mounting: "SAE C 2-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp365"
  },
  {
    id: "365C", sku: "365C", name: "PGP365C Gear Pump", category: "Mobile Gear Pumps",
    price: 620, baseCost: 375, stock: 25, inStock: true, status: "active", primaryImage: pgp365Img, secondaryImage: pgp365Img, image: pgp365Img,
    description: "PGP365C Mobile Gear Pump.", specs: { displacement: "100 cc/rev", maxPressure: "3500 PSI", maxSpeed: "2200 RPM", mounting: "SAE C 2-Bolt" },
    stockStatus: "In Stock", collections: ["mobile-gear-pumps", "shop-all"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "pgp365"
  },
  {
    id: "prod-001", sku: "HP-100", name: "Heavy Duty Gear Pump HP-100", category: "Industrial Gear Pumps",
    price: 850, baseCost: 510, stock: 45, inStock: true, status: "active", primaryImage: f1Img, secondaryImage: f1Img, image: f1Img,
    description: "Heavy Duty Gear Pump HP-100.", specs: { displacement: "100 cc/rev", maxPressure: "3000 PSI", maxSpeed: "1800 RPM", mounting: "SAE C 4-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-gear-pumps"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "missing-mock"
  },
  {
    id: "prod-005", sku: "PP-50", name: "Industrial Piston Pump PP-50", category: "Industrial Piston Pumps",
    price: 1050, baseCost: 640, stock: 25, inStock: true, status: "active", primaryImage: f1Img, secondaryImage: f1Img, image: f1Img,
    description: "Industrial Piston Pump PP-50.", specs: { displacement: "50 cc/rev", maxPressure: "4000 PSI", maxSpeed: "1800 RPM", mounting: "SAE C 4-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-piston-pumps"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "missing-mock"
  },
  {
    id: "prod-002", sku: "GP-30", name: "Gear Pump GP-30 Standard", category: "Industrial Gear Pumps",
    price: 340, baseCost: 210, stock: 60, inStock: true, status: "active", primaryImage: f1Img, secondaryImage: f1Img, image: f1Img,
    description: "Gear Pump GP-30 Standard.", specs: { displacement: "30 cc/rev", maxPressure: "3000 PSI", maxSpeed: "3000 RPM", mounting: "SAE A 2-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-gear-pumps"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "missing-mock"
  },
  {
    id: "prod-010", sku: "GP-10", name: "Compact Gear Pump GP-10", category: "Industrial Gear Pumps",
    price: 245, baseCost: 150, stock: 100, inStock: true, status: "active", primaryImage: f1Img, secondaryImage: f1Img, image: f1Img,
    description: "Compact Gear Pump GP-10.", specs: { displacement: "10 cc/rev", maxPressure: "3000 PSI", maxSpeed: "3500 RPM", mounting: "SAE A 2-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-gear-pumps"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "missing-mock"
  },
  {
    id: "prod-008", sku: "PP-150", name: "Piston Pump 3-Stage PP-150", category: "Industrial Piston Pumps",
    price: 1320, baseCost: 800, stock: 8, inStock: true, status: "active", primaryImage: f1Img, secondaryImage: f1Img, image: f1Img,
    description: "Piston Pump 3-Stage PP-150.", specs: { displacement: "150 cc/rev", maxPressure: "4000 PSI", maxSpeed: "1500 RPM", mounting: "SAE D 4-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-piston-pumps"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "missing-mock"
  },
  {
    id: "prod-003", sku: "P-80", name: "Piston Pump P-80", category: "Industrial Piston Pumps",
    price: 990, baseCost: 600, stock: 10, inStock: true, status: "active", primaryImage: f1Img, secondaryImage: f1Img, image: f1Img,
    description: "Piston Pump P-80.", specs: { displacement: "80 cc/rev", maxPressure: "4000 PSI", maxSpeed: "1800 RPM", mounting: "SAE C 4-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-piston-pumps"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "missing-mock"
  },
  {
    id: "prod-004", sku: "GP-25", name: "Gear Pump GP-25", category: "Industrial Gear Pumps",
    price: 400, baseCost: 245, stock: 60, inStock: true, status: "active", primaryImage: f1Img, secondaryImage: f1Img, image: f1Img,
    description: "Gear Pump GP-25.", specs: { displacement: "25 cc/rev", maxPressure: "3500 PSI", maxSpeed: "2800 RPM", mounting: "SAE B 2-Bolt" },
    stockStatus: "In Stock", collections: ["industrial-gear-pumps"], createdAt: "2024-01-01", updatedAt: "2024-03-10", groupId: "missing-mock"
  }
];
