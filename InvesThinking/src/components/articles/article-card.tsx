import Link from "next/link";
import { StockArticle } from "@/lib/types";

export function ArticleCard({ article }: { article: StockArticle }) {
  // Extract a brief summary from the summary table
  const summaryText = article.summaryTable.length > 0 
    ? article.summaryTable.map(row => `${row.key}: ${row.value}`).join(' | ')
    : "暂无摘要";

  return (
    <div className="border rounded-xl p-5 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-2">
        <Link href={`/articles/${article.slug}`} className="hover:underline">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {article.title}
          </h3>
        </Link>
      </div>
      <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 mb-3">
        研究日期: {article.researchDate}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
        {summaryText}
      </p>
      <Link 
        href={`/articles/${article.slug}`}
        className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center transition-colors"
      >
        Read <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
      </Link>
    </div>
  );
}
