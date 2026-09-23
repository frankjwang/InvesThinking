import fs from "fs";
import path from "path";
import { getAllArticles } from "@/lib/parse-articles";
import { StockPrice } from "@/lib/types";
import { StockCard } from "@/components/stock-watch/stock-card";
import { ArticleCard } from "@/components/articles/article-card";

export default async function Home() {
  const articles = await getAllArticles();
  
  // Read stock prices
  let stockPrices: StockPrice[] = [];
  try {
    const dataPath = path.join(process.cwd(), "data", "stock-prices.json");
    const fileContents = fs.readFileSync(dataPath, "utf8");
    stockPrices = JSON.parse(fileContents);
  } catch (e) {
    console.error("Failed to read stock prices", e);
  }

  const getPriceData = (ticker: string) => {
    return stockPrices.find(p => p.ticker === ticker);
  };

  return (
    <main>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Stock Watch */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              -- Stock Watch
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {articles.map((article) => (
              <StockCard 
                key={article.ticker} 
                article={article} 
                priceData={getPriceData(article.ticker)} 
              />
            ))}
          </div>
        </div>

        {/* Right Main Content: Research Articles */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Research Articles
            </h2>
            <span className="text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {articles.length}
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-16 pt-8 border-t flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
        <div>Last updated: {new Date().toISOString().split('T')[0]} 12:00</div>
        <div>Prices updated via yfinance</div>
      </footer>
    </main>
  );
}
