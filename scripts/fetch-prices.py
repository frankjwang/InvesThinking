import yfinance as yf
import json
import os
import re
from datetime import datetime

articles_dir = "InvesThinking/articles"
data_dir = "InvesThinking/data"
os.makedirs(data_dir, exist_ok=True)

tickers = set()

# Parse tickers from filenames
if os.path.exists(articles_dir):
    for filename in os.listdir(articles_dir):
        if filename.endswith(".md"):
            # Match （TICKER）or (TICKER)
            match = re.search(r'[（\(](.*?)[）\)]', filename)
            if match:
                tickers.add(match.group(1).strip())

data = []
for t in tickers:
    try:
        stock = yf.Ticker(t)
        info = stock.fast_info
        
        last_price = info.last_price
        prev_close = info.previous_close
        change = round((last_price / prev_close - 1) * 100, 4) if prev_close else 0
        
        data.append({
            "ticker": t,
            "price": round(last_price, 2),
            "change": change,
            "updatedAt": datetime.utcnow().isoformat() + "Z"
        })
    except Exception as e:
        print(f"Error fetching {t}: {e}")

output_path = os.path.join(data_dir, "stock-prices.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print(f"Successfully updated {len(data)} tickers.")
