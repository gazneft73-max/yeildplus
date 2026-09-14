import { getAllPlans } from "@/lib/server/plans";
import { PageHeader } from "@/components/app/shell";
import { PlansManager } from "./plans-manager";

export default async function AdminPlans() {
  const plans = await getAllPlans();
  return (
    <>
      <PageHeader title="Plans" text="Investment plans, real-estate packages and mining contracts shown to members. Inactive plans are hidden but existing contracts continue." />
      <PlansManager investment={plans.investment} mining={plans.mining} />
    </>
  );
}
