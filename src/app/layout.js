import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "StudyFlash",
  description: "Created by the GOAT",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div className="flex min-h-screen flex-col p-5 animated-bg">
          <Navbar />
          <Toaster toastOptions={{ duration: 1000 }} />
          <main className="min-h-dvh">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
