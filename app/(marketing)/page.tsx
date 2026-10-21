import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import Hero from "@/components/starterPage/Hero";
import AppPreview from "@/components/starterPage/AppPreview";
import Features from "@/components/starterPage/Features";
import JourneyMap from "@/components/starterPage/JourneySimulation";
import Testimonials from "@/components/starterPage/Feedback";
import CtaBanner from "@/components/starterPage/Banner";

export default async function Home() {
  if (await getSessionUser()) redirect("/dashboard");

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