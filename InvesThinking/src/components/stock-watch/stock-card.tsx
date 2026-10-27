"use client";
import { useState } from "react";
import { StockArticle, StockPrice } from "@/lib/types";

// Determine color based on tier index (0=high/red, 5=low/green)
function getTierColors(index: number) {
  const colors = [
    "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
    "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30",
    "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
    "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    "bg-green-600/20 text-green-700 dark:text-green-400 border-green-600/30"
  ];
  return colors[index] || colors[colors.length - 1];
}

// Helper to check if current price falls within a tier range description
function isPriceInTier(price: number | string, rangeText: string): boolean {
  if (typeof price !== 'number' || isNaN(price)) return false;
  const clean = rangeText.replace(/,/g, '');
  
  // "90美元以上" or "12美元以上"
  const aboveMatch = clean.match(/(\d+(?:\.\d+)?)\s*美元以上/);
  if (aboveMatch) {
    return price >= parseFloat(aboveMatch[1]);
  }
  
  // "明显低于5美元" or "35美元附近或以下"
  const belowMatch = clean.match(/(?:明显低于|低于)\s*(\d+(?:\.\d+)?)\s*美元|(\d+(?:\.\d+)?)\s*美元(?:附近)?或以下/);
  if (belowMatch) {
    return price < parseFloat(belowMatch[1] || belowMatch[2]);
  }
  
  // "70–90美元" or "6–7美元" or "53–68美元" or "40–45美元附近"
  const rangeMatch = clean.match(/(\d+(?:\.\d+)?)\s*[–\-~到至]\s*(\d+(?:\.\d+)?)\s*美元/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    return price >= min && price <= max;
  }
  
  return false;
}

export function StockCard({ article, priceData }: { article: StockArticle, priceData?: StockPrice }) {
  const [expanded, setExpanded] = useState(false);
  
  // Extract entry zone from article metadata or price tiers
  const entryZone = article.entryZone && article.entryZone !== 'N/A'
    ? article.entryZone
    : (article.priceTiers.length >= 2 
        ? article.priceTiers[article.priceTiers.length - 2].priceRange 
        : "N/A");

  const price = priceData ? priceData.price : '--';
  const change = priceData ? priceData.change : 0;
  const isPositive = change >= 0;

  return (
    <div className="border rounded-xl p-4 bg-white dark:bg-slate-900 shadow-sm transition-all">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {article.ticker}
          </span>
          <h3 className="mt-1 text-sm text-slate-500 dark:text-slate-400">{article.companyName}</h3>
        </div>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1 rounded-md transition-colors"
        >
          Details {expanded ? "▲" : "▼"}
        </button>
      </div>

      <div className="flex items-end gap-3 mb-3">
        <div className="text-3xl font-bold">${price}</div>
        {priceData && (
          <div className={`text-sm font-medium mb-1 px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
            {isPositive ? '+' : ''}{change.toFixed(2)}%
          </div>
        )}
      </div>

      <div className="text-sm text-slate-600 dark:text-slate-300">
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">建仓区间: </span>
        {entryZone}
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Price Tier</h4>
          <div className="flex flex-col gap-1.5 mb-4">
            {article.priceTiers.map((tier, idx) => {
              const isCurrent = isPriceInTier(price, tier.priceRange);
              
              return (
                <div 
                  key={idx} 
                  className={`flex justify-between items-center p-2 rounded border transition-all ${getTierColors(idx)} ${isCurrent ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-md font-semibold scale-[1.02]' : 'opacity-85 hover:opacity-100'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{tier.priceRange}</span>
                    {isCurrent && (
                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                        当前
                      </span>
                    )}
                  </div>
                  <span className="text-xs opacity-90 truncate ml-4 max-w-[60%] text-right">{tier.judgment}</span>
                </div>
              );
            })}
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
            <h4 className="text-xs font-medium text-slate-500 mb-1">Judgment</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">{article.judgment}</p>
          </div>
        </div>
      )}
    </div>
  );
}
