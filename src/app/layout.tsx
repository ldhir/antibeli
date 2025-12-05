import type { Metadata } from "next";
import { Forum, Courier_Prime, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Cart from "@/components/Cart";

const forum = Forum({
  weight: "400",
  variable: "--font-forum",
  subsets: ["latin"],
});

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  variable: "--font-courier-prime",
  subsets: ["latin"],
});

const nunitoSans = Nunito_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beli at Home - Restaurant Dishes, Home Prices",
  description: "Cook your favorite restaurant dishes at home and save money",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${forum.variable} ${courierPrime.variable} ${nunitoSans.variable} antialiased`}
      >
        <StoreProvider>
          {children}
          <Cart />
        </StoreProvider>
      </body>
    </html>
  );
}
