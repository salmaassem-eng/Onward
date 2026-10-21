import Navbar from "@/components/starterPage/Navbar";
import Footer from "@/components/starterPage/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f8f4]">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
