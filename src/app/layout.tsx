import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import Link from "next/link";

// Load the ABCDiatype font (Regular and Bold only)
const abcdDiatype = localFont({
  src: [
    { path: "./fonts/ABCDiatype-Regular.otf", weight: "400" },
    { path: "./fonts/ABCDiatype-Bold.otf", weight: "700" },
  ],
  variable: "--font-abcd-diatype",
});

// Load the Reckless font (Regular and Medium only)
const reckless = localFont({
  src: [
    { path: "./fonts/RecklessTRIAL-Regular.woff2", weight: "400" },
    { path: "./fonts/RecklessTRIAL-Medium.woff2", weight: "500" },
  ],
  variable: "--font-reckless",
});

export const metadata: Metadata = {
  title: "Websets News Monitor",
  description: "Monitor news and updates from your websets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${abcdDiatype.variable} ${reckless.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col relative">
          {/* Main Content */}
          <main className="flex-1 w-full">
            {children}
          </main>

          {/* Footer */}
          <footer className="w-full py-4 bg-secondary-default border-t border-gray-200">
            <div className="max-w-2xl mx-auto flex items-center justify-center px-4 gap-4">
              <Link
                href="https://github.com/exa-labs/company-researcher"
                target="_blank"
                rel="origin"
                className="text-gray-600 hover:underline cursor-pointer text-center"
              >
                View Project Code
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                href="https://exa.ai/demos"
                target="_blank"
                rel="origin"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 hover:text-gray-600 hover:underline">See More Demos</span>
                </div>
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                href="https://dashboard.exa.ai"
                target="_blank"
                rel="origin"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 hover:text-gray-600 hover:underline">Try Exa API</span>
                </div>
              </Link>
            </div>
          </footer>

        </div>
      </body>
    </html>
  );
}
