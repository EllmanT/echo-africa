import { navItems } from "@/data";
import { FloatingNav } from "./ui/FloatingNavbar";
import Footer from "./Footer";

const PageShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="relative bg-background flex justify-center items-center flex-col overflow-x-clip mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full">
        <FloatingNav navItems={navItems} />
        <div className="pt-32">{children}</div>
        <Footer />
      </div>
    </main>
  );
};

export default PageShell;
