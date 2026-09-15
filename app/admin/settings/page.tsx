import { getSettings } from "@/lib/server/settings";
import { PageHeader } from "@/components/app/shell";
import { SettingsForm } from "./settings-form";

export default async function AdminSettings() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="Settings" text="Deposit addresses, limits, fees and platform-wide messages." />
      <SettingsForm settings={settings} />
    </>
  );
}
