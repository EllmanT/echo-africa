import FaqsManager from "@/components/admin/FaqsManager";

const FaqsPage = () => (
  <div>
    <h1 className="font-display text-2xl font-bold tracking-tight">FAQs</h1>
    <p className="mt-1 text-sm text-muted-foreground">Shown as an accordion on each page, and fed to Google as FAQ markup.</p>
    <div className="mt-6">
      <FaqsManager />
    </div>
  </div>
);

export default FaqsPage;
