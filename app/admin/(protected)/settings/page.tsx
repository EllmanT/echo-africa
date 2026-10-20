import { getAdminSettings } from "@/lib/admin/settings";
import { monthlySpendUsd } from "@/lib/playbook/budget";
import { reviewSpendThisMonthUsd } from "@/lib/review/budget";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

const SettingsPage = async () => {
  const [settings, spentUsd, reviewSpentUsd] = await Promise.all([getAdminSettings(), monthlySpendUsd(), reviewSpendThisMonthUsd()]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">These take effect on the next form submission.</p>
      <div className="mt-6">
        <SettingsForm initial={settings} spentUsd={spentUsd} reviewSpentUsd={reviewSpentUsd} />
      </div>
    </div>
  );
};

export default SettingsPage;
