import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export 
/**
 * metadata component.
 */
const metadata: Metadata = {
  title: "darts-wien",
  description: "",
  icons: {
    icon: "/favicon.svg",
  },
};


/**
 * Root application layout with providers.
 *
 * @param props - Component properties.
 */
const RootLayout = ({ children }: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export default RootLayout;
