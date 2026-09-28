import { getPricingConfig } from "@/lib/content/pricing";
import PricingEditor from "@/components/admin/PricingEditor";

export const dynamic = "force-dynamic";

const PricingPage = async () => {
  const config = await getPricingConfig();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Pricing tiers</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        These are the price cards on the last step of the contact form. Changes go live within a minute. Old leads keep the
        range they actually saw.
      </p>
      <div className="mt-6">
        <PricingEditor initial={config} />
      </div>
    </div>
  );
};

export default PricingPage;
