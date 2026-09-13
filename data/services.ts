export type ServiceFAQ = { question: string; answer: string };

export type Service = {
  slug: string;
  name: string;
  shortDescription: string;
  heroDescription: string;
  keywords: string[];
  features: { title: string; description: string }[];
  faqs: ServiceFAQ[];
};

export const services: Service[] = [
  {
    slug: "web-development",
    name: "Web Development",
    shortDescription:
      "Fast, professional websites built for Zimbabwean and African businesses — designed to load quickly on any device and turn visitors into customers.",
    heroDescription:
      "We design and build websites for businesses in Zimbabwe and across Africa — fast, mobile-friendly, and built to work reliably wherever your customers are browsing from. You see the finished site before you pay a single dollar.",
    keywords: [
      "web development Zimbabwe",
      "website design Harare",
      "web developer Zimbabwe",
      "business website Zimbabwe",
      "affordable website Harare",
    ],
    features: [
      {
        title: "Built for real network conditions",
        description:
          "Sites optimised to load fast on mobile data, not just fibre — because that's how most of your customers in Zimbabwe will actually visit.",
      },
      {
        title: "Mobile-first design",
        description:
          "Every site is designed and tested to work cleanly on phones first, then scaled up — matching how most local traffic actually browses.",
      },
      {
        title: "Modern tech, built to last",
        description:
          "We build on Next.js and TypeScript — the same stack used by major global companies — so your site stays fast, secure, and easy to extend.",
      },
      {
        title: "Zero-risk delivery",
        description:
          "We build your complete website before you pay anything. Love it, pay. Don't, walk away.",
      },
    ],
    faqs: [
      {
        question: "How much does a website cost in Zimbabwe with Eka?",
        answer:
          "Cost depends on the scope of the site — a simple business site is a smaller project than a catalogue-driven site with dozens of listings. Because we work on a zero-risk basis, you see the finished website and agree the price before you pay anything, so there's no upfront guesswork.",
      },
      {
        question: "How long does it take to build a website?",
        answer:
          "Most business websites are built within days to a couple of weeks, depending on scope and how quickly content and feedback come back to us.",
      },
      {
        question: "Do I need to pay anything upfront?",
        answer:
          "No. We design and build your complete website first. You only pay once you've seen it and you're happy with it.",
      },
      {
        question: "Will my website work well on mobile?",
        answer:
          "Yes — every site we build is designed mobile-first, since most visitors in Zimbabwe and across Africa browse on phones rather than desktops.",
      },
    ],
  },
  {
    slug: "ai-automation",
    name: "AI Automation",
    shortDescription:
      "AI-powered automation for African businesses — document processing, reporting, and workflow automation that saves your team real hours every week.",
    heroDescription:
      "We build AI automation that takes repetitive, manual work off your team's plate — document processing, reporting, customer enquiries, and scheduling — so your people can focus on work that actually needs them.",
    keywords: [
      "AI automation Zimbabwe",
      "business automation Harare",
      "AI agency Africa",
      "document processing automation",
      "workflow automation Zimbabwe",
    ],
    features: [
      {
        title: "Document & invoice processing",
        description:
          "Automate the manual re-typing of invoices, receipts, and delivery notes into your accounting or business systems.",
      },
      {
        title: "Customer enquiry automation",
        description:
          "Handle repetitive WhatsApp and email questions automatically, freeing your team for enquiries that need a real person.",
      },
      {
        title: "Automated reporting",
        description:
          "Reports that build themselves on a schedule from your existing data sources, instead of being assembled by hand every week.",
      },
      {
        title: "Built one task at a time",
        description:
          "We automate a single, clearly-defined task first and prove it works reliably before expanding — not a risky all-at-once overhaul.",
      },
    ],
    faqs: [
      {
        question: "What does AI automation actually mean for a small business?",
        answer:
          "In practice, it means taking a repetitive task your team already does by hand — data entry, document processing, answering routine questions — and having software handle it reliably instead, usually combining a trigger (a new email, an order, a form) with an AI-assisted step.",
      },
      {
        question: "Which tasks should I automate first?",
        answer:
          "The best starting points are tasks that happen often, are repetitive, and are currently done manually: document/invoice processing, routine customer enquiries, and recurring reports are usually the highest-value places to start.",
      },
      {
        question: "How much does AI automation cost?",
        answer:
          "It depends on how many systems the automation needs to connect to and how much judgment the AI step requires. Most projects are scoped around a single, well-defined task rather than a full system overhaul, which keeps cost and timeline predictable.",
      },
      {
        question: "Is AI automation reliable enough for something like invoicing?",
        answer:
          "Yes, when built correctly — with a human review step for anything involving money or legal documents. We don't remove oversight where mistakes are costly; we remove repetitive manual work.",
      },
    ],
  },
  {
    slug: "software-development",
    name: "Custom Software Development",
    shortDescription:
      "Custom software and systems for African businesses — from internal tools to specialised systems like ZIMRA fiscalisation integration.",
    heroDescription:
      "Beyond websites, we build custom software for businesses with needs a template can't cover — internal tools, system integrations, and specialised systems including ZIMRA fiscalisation.",
    keywords: [
      "custom software development Zimbabwe",
      "software development company Harare",
      "fiscalisation systems Zimbabwe",
      "ZIMRA fiscalisation integration",
      "business software Zimbabwe",
    ],
    features: [
      {
        title: "ZIMRA fiscalisation systems",
        description:
          "Implementation and support of fiscalisation systems for Zimbabwean businesses, trusted by multiple clients for technical reliability and fast response.",
      },
      {
        title: "Internal tools & dashboards",
        description:
          "Purpose-built internal tools that fit how your business actually operates, instead of forcing your team to work around generic software.",
      },
      {
        title: "System integration",
        description:
          "Connecting the systems you already use — accounting, stock, CRM — so data moves between them without manual re-entry.",
      },
      {
        title: "Built to your business, not a template",
        description:
          "Every custom system starts from your actual workflow, not a one-size-fits-all product forced to fit your business.",
      },
    ],
    faqs: [
      {
        question: "Do you support ZIMRA fiscalisation systems?",
        answer:
          "Yes — we implement and support fiscalisation systems for businesses across Zimbabwe, and are trusted by multiple clients for reliable, fast technical support.",
      },
      {
        question: "What kind of custom software do you build?",
        answer:
          "Internal tools, dashboards, system integrations, and specialised business systems — anything a generic off-the-shelf product doesn't fit well.",
      },
      {
        question: "Can you integrate with the systems we already use?",
        answer:
          "In most cases, yes. We assess your existing accounting, stock, or CRM systems and build integrations so data flows automatically instead of being re-entered by hand.",
      },
    ],
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}
