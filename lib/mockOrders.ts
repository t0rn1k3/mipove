import type { DummyOrder } from "@/lib/types";

/**
 * User-generated/private order content must stay source-language as entered.
 * Keep it in code (not translated message files) so locale switching does not rewrite it.
 */
export const MOCK_ORDERS: DummyOrder[] = [
  {
    imageSrc: "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=200&q=80",
    imageAlt: "Handmade ceramic vase",
    title: "Custom stoneware vase set",
    description: "Three-piece table vase set, matte glaze, earth tones to match your dining space.",
    category: "clay",
    priceRange: "₾320 – ₾480",
    budgetMin: 320,
    budgetMax: 480,
    priceNegotiable: false,
    location: "Tbilisi",
    deadline: "month",
    expectedBy: "Apr 12, 2026",
    publisherName: "Nino Kvaratskhelia",
    publisherPhone: "+995 555 12 34 01",
    publisherEmail: "nino.k@example.ge",
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=200&q=80",
    imageAlt: "Oak dining table",
    title: "Oak dining table (6 seats)",
    description: "Farmhouse-style solid oak table with oil finish and sturdy trestle base.",
    category: "wood",
    priceRange: "₾2,800 – ₾4,200",
    budgetMin: 2800,
    budgetMax: 4200,
    priceNegotiable: false,
    location: "Kutaisi",
    deadline: "month",
    expectedBy: "May 3, 2026",
    publisherName: "Giorgi Beridze",
    publisherPhone: "+995 599 98 76 54",
    publisherEmail: "giorgi.b@example.ge",
  },
  {
    imageSrc: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=200&q=80",
    imageAlt: "Wrought iron gate",
    title: "Garden gate & side panels",
    description: "Wrought iron pedestrian gate with matching fixed panels, powder-coated black.",
    category: "metal",
    priceRange: "₾1,900 – ₾2,600",
    budgetMin: 1900,
    budgetMax: 2600,
    priceNegotiable: true,
    location: "Batumi",
    deadline: "week",
    expectedBy: "Apr 28, 2026",
    publisherName: "Mariam Gelashvili",
    publisherPhone: "+995 555 44 20 18",
    publisherEmail: "mariam.g@example.ge",
  },
];
