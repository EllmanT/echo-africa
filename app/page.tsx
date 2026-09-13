"use client";

import { navItems } from "@/data";

import Hero from "@/components/Hero";
import Grid from "@/components/Grid";
import Footer from "@/components/Footer";
import Clients from "@/components/Clients";
import Approach from "@/components/Approach";
import RecentProjects from "@/components/RecentProjects";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import JsonLd from "@/components/seo/JsonLd";
import { buildFAQSchema } from "@/lib/seo/structured-data";

const homeFaqs = [
  {
    question: "Do I need to pay Eka anything upfront?",
    answer:
      "No. Eka builds your website, logo, or AI system first, on a zero-risk basis — you only pay once you've seen it and you're happy with it.",
  },
  {
    question: "Does Eka work with businesses outside Harare?",
    answer:
      "Yes. Eka works with businesses across Zimbabwe and other African countries, building websites, AI automation, and custom software remotely.",
  },
  {
    question: "What does Eka build?",
    answer:
      "Eka builds websites, brand identity/logos, AI automation, and custom software — including ZIMRA fiscalisation systems support for Zimbabwean businesses.",
  },
];

const Home = () => {
  return (
    <main className="relative bg-background flex justify-center items-center flex-col overflow-x-clip mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full">
        <JsonLd data={buildFAQSchema(homeFaqs)} />
        <FloatingNav navItems={navItems} />
        <Hero />
        <Grid />
        <RecentProjects />
        <Clients />
        <Approach />
        <Footer />
      </div>
    </main>
  );
};

export default Home;
