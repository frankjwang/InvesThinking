import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { StockArticle, SummaryRow, PriceTier } from './types';

const articlesDirectory = path.join(process.cwd(), 'articles');

export async function getAllArticles(): Promise<StockArticle[]> {
  if (!fs.existsSync(articlesDirectory)) return [];
  const fileNames = fs.readdirSync(articlesDirectory).filter(f => f.endsWith('.md'));
  
  const allArticlesData = await Promise.all(
    fileNames.map(async (fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(articlesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // The MD files might not have frontmatter, so gray-matter will just put everything in content
      const matterResult = matter(fileContents);
      const rawContent = matterResult.content;
      
      // Parse ticker and company name from fileName: "MaxLinear（MXL）：..."
      // Supports both fullwidth '（' and halfwidth '('
      let ticker = '';
      let companyName = '';
      const match = slug.match(/^(.*?)[（\(](.*?)[）\)](：|:)(.*)$/);
      if (match) {
        companyName = match[1].trim();
        ticker = match[2].trim();
      } else {
        companyName = slug;
      }

      // Extract research date (heuristic: look for "202x年x月x日" or similar)
      let researchDate = 'Unknown Date';
      const dateMatch = rawContent.match(/(\d{4}年\d{1,2}月\d{1,2}日)/);
      if (dateMatch) {
        researchDate = dateMatch[1];
      }

      // Extract Summary Table
      const summaryTable: SummaryRow[] = [];
      const lines = rawContent.split('\n');
      let inSummaryTable = false;
      let inPriceTierTable = false;
      const priceTiers: PriceTier[] = [];
      let judgment = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Find Summary Table
        if (line.includes('| 项目 | 我的判断 |') || line.includes('|项目|我的判断|')) {
          inSummaryTable = true;
          i++; // skip separator line `|---|---|`
          continue;
        }
        if (inSummaryTable) {
          if (line.startsWith('|')) {
            const parts = line.split('|').map(p => p.trim()).filter(Boolean);
            if (parts.length >= 2 && !parts[0].includes('---')) {
              summaryTable.push({ key: parts[0].replace(/\*\*/g, ''), value: parts[1].replace(/\*\*/g, '') });
            }
          } else if (line !== '') {
            inSummaryTable = false;
          }
        }

        // Find Price Tier Table
        if (line.includes('我的价格梯度')) {
          // Look ahead for the table
          for (let j = i + 1; j < lines.length && j < i + 10; j++) {
            if (lines[j].includes('|') && (lines[j].includes('价格区间') || lines[j].includes('股价区间'))) {
              inPriceTierTable = true;
              i = j + 1; // skip separator
              break;
            }
          }
          continue;
        }

        if (inPriceTierTable) {
          if (line.startsWith('|')) {
            const parts = line.split('|').map(p => p.trim()).filter(Boolean);
            if (parts.length >= 2 && !parts[0].includes('---')) {
              priceTiers.push({ priceRange: parts[0].replace(/\*\*/g, ''), judgment: parts[1].replace(/\*\*/g, '') });
            }
          } else if (line !== '') {
            inPriceTierTable = false;
          }
        }
        
        // Final judgment usually towards the end, after price tiers or under "最终结论"
        if ((line.includes('最终结论') || line.includes('最终判断')) && line.startsWith('#')) {
          // get the next non-empty lines
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].trim() !== '') {
              judgment += lines[j].trim() + ' ';
              if (judgment.length > 100) break;
            }
          }
        }
      }

      // If no final judgment found, fallback to the last summary table row or last price tier judgment
      if (!judgment && summaryTable.length > 0) {
        // try to find row containing "是否" or "当前价格判断"
        const row = summaryTable.find(r => r.key.includes('是否') || r.key.includes('买入'));
        if (row) judgment = row.value;
        else judgment = summaryTable[summaryTable.length - 1].value;
      }

      // Use remark to convert markdown into HTML string
      const processedContent = await remark()
        .use(html)
        .process(rawContent);
      const contentHtml = processedContent.toString();

      return {
        slug,
        ticker,
        companyName,
        title: slug,
        researchDate,
        summaryTable,
        priceTiers,
        judgment: judgment.trim(),
        content: contentHtml,
      };
    })
  );

  // Sort articles by date (approximate, since we don't have standard timestamps, sort alphabetically descending by filename for now)
  return allArticlesData.sort((a, b) => (a.slug < b.slug ? 1 : -1));
}

export async function getArticleBySlug(slug: string): Promise<StockArticle | undefined> {
  const articles = await getAllArticles();
  return articles.find(article => article.slug === slug);
}
