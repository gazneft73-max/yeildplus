import { Hero } from "@/components/site/hero";
import { Ticker } from "@/components/site/ticker";
import { Cta, Faq, Features, HowItWorks, MiningShowcase, PlansShowcase, RealEstateShowcase, Security, SupportStrip, Testimonials } from "@/components/site/sections";
import { getPrices } from "@/lib/server/prices";
import { getSession } from "@/lib/server/session";
import { getPublicPlans } from "@/lib/server/plans";

export const revalidate = 60;

export default async function HomePage() {
  const [prices, session, plans] = await Promise.all([getPrices(), getSession().catch(() => null), getPublicPlans()]);
  const signedIn = Boolean(session);
  return (
    <>
      <Hero prices={prices} signedIn={signedIn} />
      <Ticker prices={prices} />
      <Features />
      <PlansShowcase plans={plans.investing} signedIn={signedIn} />
      <MiningShowcase plans={plans.mining} signedIn={signedIn} />
      <RealEstateShowcase plans={plans.realEstate} signedIn={signedIn} />
      <HowItWorks />
      <Security />
      <Testimonials />
      <Faq />
      <SupportStrip />
      <Cta signedIn={signedIn} />
    </>
  );
}
