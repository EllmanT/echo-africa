/** One accent per item. The matching .svc-* class in globals.css sets the colours. */
export type AccordionTone = "web" | "ai" | "int" | "soft" | "logo";

/** What each service page adds on top of data/services.ts: colour, photos, the plain-words process and where the quote link goes. */
export type ServicePageExtras = {
  tone: AccordionTone;
  quoteHref: string;
  tagline: string;
  visualLabel: string;
  photos: { src: string; alt: string }[];
  stepsHeading: string;
  steps: { title: string; body: string }[];
};

export const servicePageExtras: Record<string, ServicePageExtras> = {
  "web-development": {
    tone: "web",
    quoteHref: "/contact?service=website",
    tagline: "Websites that bring in customers.",
    visualLabel: "A website being built on a desktop and shown on a phone",
    photos: [
      { src: "/images/services/web-1.jpg", alt: "A developer writing code at a desk with a monitor and a laptop" },
      { src: "/images/services/web-2.jpg", alt: "Colleagues working at laptops in a bright office" },
    ],
    stepsHeading: "From first chat to live site",
    steps: [
      { title: "We listen", body: "A short chat about your business, your customers and what you want the site to do for you." },
      { title: "We design and build", body: "You get a real, working site, not a mock-up. Built for phones first, then scaled up." },
      { title: "You review it", body: "Tell us what to change. We keep refining it until it feels exactly right." },
      { title: "You pay, we launch", body: "Only when you love it. Then we put it live and stay on hand if anything needs a tweak." },
    ],
  },
  "ai-automation": {
    tone: "ai",
    quoteHref: "/contact?service=ai-automation",
    tagline: "Let the boring work do itself.",
    visualLabel: "A workflow: a message arrives, AI reads it, an invoice is made and the customer gets a reply",
    photos: [
      { src: "/images/services/ai-1.jpg", alt: "A white robotic arm at work in a modern building" },
      { src: "/images/services/ai-2.jpg", alt: "Four women gathered around a laptop in an office, smiling" },
    ],
    stepsHeading: "How we automate your week",
    steps: [
      { title: "Find the slow work", body: "We look at the tasks eating your week: replies, invoices, reminders and follow-ups." },
      { title: "Design the flow", body: "We map how a message, an order or a form turns into finished work, step by step." },
      { title: "Build and test it", body: "We build it with n8n and AI, then test it on your own real examples." },
      { title: "Switch on and tune", body: "You approve it, we turn it on, and we keep tuning it as it learns your business." },
    ],
  },
  "system-integration": {
    tone: "int",
    quoteHref: "/contact?service=system-integration",
    tagline: "Your tools, finally talking to each other.",
    visualLabel: "Six business tools connected to a central hub by lines carrying information",
    photos: [
      { src: "/images/services/integration-1.jpg", alt: "Teal fibre-optic cables plugged into a network panel" },
      { src: "/images/services/integration-2.jpg", alt: "A server cabinet glowing blue in a dark room" },
    ],
    stepsHeading: "How we connect it all",
    steps: [
      { title: "Map your tools", body: "We list what you use today, from WhatsApp and email to spreadsheets and accounting." },
      { title: "Connect them", body: "Information moves on its own, so nobody retypes the same thing twice." },
      { title: "Test with real data", body: "We run it on your real orders and invoices before anything goes live." },
      { title: "Switch on and watch", body: "We turn it on, keep an eye on it, and fix anything that slips." },
    ],
  },
  "software-development": {
    tone: "soft",
    quoteHref: "/contact?service=custom-software",
    tagline: "Software shaped around how you work.",
    visualLabel: "A custom business dashboard with figures, a task list and a new order arriving",
    photos: [
      { src: "/images/services/software-1.jpg", alt: "A laptop showing business software with charts and tables" },
      { src: "/images/services/software-2.jpg", alt: "A tablet showing an analytics dashboard beside a cup of coffee" },
    ],
    stepsHeading: "How we build your software",
    steps: [
      { title: "Understand the process", body: "We watch how your business really runs, so the software fits the work and not the other way round." },
      { title: "Sketch the screens", body: "You see simple drawings of every screen and agree them before we write any code." },
      { title: "Build in small steps", body: "You try each piece as it is finished, so there are no big surprises at the end." },
      { title: "Launch and support", body: "We put it live, train your team, and stay available as your needs grow." },
    ],
  },
  "logo-design": {
    tone: "logo",
    quoteHref: "/contact?service=logo",
    tagline: "A mark people remember.",
    visualLabel: "A logo being built on guide lines, a colour palette and two logos Eka designed",
    photos: [
      { src: "/images/services/logo-1.jpg", alt: "Hands sketching logo ideas on paper at a desk" },
      { src: "/images/services/logo-2.jpg", alt: "A hand-signed style logo printed on a sheet of paper" },
    ],
    stepsHeading: "How we shape your brand",
    steps: [
      { title: "Learn your brand", body: "Who you are, who you serve and how you want to be seen." },
      { title: "Sketch ideas", body: "We explore a few directions on paper before anything is polished." },
      { title: "Refine your favourite", body: "You choose a direction and we perfect it, with colours and type that match." },
      { title: "Hand over the files", body: "Logo files ready for signage, paperwork and screens, so it looks right everywhere." },
    ],
  },
};
