import Hero from "@/components/starterPage/Hero";
import AppPreview from "@/components/starterPage/AppPreview";
import Features from "@/components/starterPage/Features";
import JourneyMap from "@/components/starterPage/JourneySimulation";
import Testimonials from "@/components/starterPage/Feedback";
import CtaBanner from "@/components/starterPage/Banner";

export default async function Home() {
  return (
    <>
      <Hero />
      <AppPreview />
      <Features />
      <JourneyMap />
      <Testimonials />
      <CtaBanner />
    </>
  );
}