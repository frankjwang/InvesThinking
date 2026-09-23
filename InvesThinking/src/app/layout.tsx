import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "InvesThinking Lab",
  description: "Stock Research and Analysis Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-slate-950">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="mb-8 border-b pb-4">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                InvesThinking Lab
              </h1>
            </header>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
