export interface SummaryRow {
  key: string;
  value: string;
}

export interface PriceTier {
  priceRange: string;
  judgment: string;
}

export interface StockArticle {
  slug: string;
  ticker: string;
  companyName: string;
  title: string;
  researchDate: string;
  summaryTable: SummaryRow[];
  priceTiers: PriceTier[];
  judgment: string;
  content: string; // The HTML content
}

export interface StockPrice {
  ticker: string;
  price: number;
  change: number;
  updatedAt: string;
}
