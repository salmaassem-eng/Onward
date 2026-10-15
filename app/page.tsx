import Navbar from "@/components/starterPage/Navbar";
import Hero from "@/components/starterPage/Hero";
import AppPreview from "@/components/starterPage/AppPreview";
import Features from "@/components/starterPage/Features";
import JourneyMap from "@/components/starterPage/JourneySimulation";
import Testimonials from "@/components/starterPage/Feedback";
import CtaBanner from "@/components/starterPage/Banner";
import Footer from "@/components/starterPage/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f8f4]">
      <Navbar />
      <main>
        <Hero />
        <AppPreview />
        <Features />
        {/* <JourneyMap />
        <Testimonials />
        <CtaBanner /> */}
      </main>
      {/* <Footer /> */}
    </div>
  );
}