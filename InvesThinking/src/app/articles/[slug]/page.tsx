import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/lib/parse-articles";

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const article = await getArticleBySlug(slug);
  
  if (!article) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/" 
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center mb-6"
        >
          <span className="mr-1">←</span> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-4">
          {article.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {article.ticker}
          </span>
          <span>{article.researchDate}</span>
        </div>
      </div>
      
      {/* Markdown Content rendered as HTML */}
      <div 
        className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-table:border-collapse prose-th:border prose-th:border-slate-300 dark:prose-th:border-slate-700 prose-th:p-2 prose-td:border prose-td:border-slate-300 dark:prose-td:border-slate-700 prose-td:p-2"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}
