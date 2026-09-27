import SiteHeader from "./SiteHeader";
import Footer from "./Footer";

const PageShell = ({
  children,
  showCta = true,
}: {
  children: React.ReactNode;
  showCta?: boolean;
}) => {
  return (
    <main className="relative bg-background flex justify-center items-center flex-col overflow-x-clip mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full">
        <SiteHeader />
        <div className="pt-24">{children}</div>
        <Footer showCta={showCta} />
      </div>
    </main>
  );
};

export default PageShell;
