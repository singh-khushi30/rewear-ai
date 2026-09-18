import { AgentPreview } from "@/components/landing/agent-preview";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Sustainability } from "@/components/landing/sustainability";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <HowItWorks />
        <AgentPreview />
        <Sustainability />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
