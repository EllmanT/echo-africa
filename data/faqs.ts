export type Faq = { question: string; answer: string };

export const workFaqs: Faq[] = [
  {
    question: "What does \"pay only when you love it\" really mean?",
    answer:
      "We build your website, logo or system first, with no deposit. You look at it, test it and tell us what to change. If you love it, you pay. If you don't, you walk away and you owe us nothing.",
  },
  {
    question: "How much will it cost?",
    answer:
      "A simple business website starts at $500. Bigger projects, like a dealership site with many pages and vehicle listings, cost a few thousand dollars. You get a clear price before we start, so there are no surprises.",
  },
  {
    question: "How long does it take?",
    answer:
      "You see a first version within days, not months. Bigger projects take longer, and we tell you the timeline before we start.",
  },
  {
    question: "Will my website really bring me customers?",
    answer:
      "A good website makes it easy for people to find you, trust you and contact you. On the Faramatsi projects, the number of people finding the sites on Google grew 7 to 14 times in three months. We can't promise the same numbers for every business, but we build every site to be found and to convert.",
  },
  {
    question: "Will it work on phones and slow internet?",
    answer:
      "Yes. Most of your customers browse on their phones, often on mobile data. We build phone-first and keep pages light so they load fast.",
  },
  {
    question: "Can I change the text and photos myself later?",
    answer:
      "Yes, we can set it up so you can edit your own text and photos without calling a developer. Tell us this on the first call and we plan for it.",
  },
  {
    question: "Do you work with businesses outside Harare?",
    answer:
      "Yes. We work with businesses across Zimbabwe and other African countries. Everything happens online and on WhatsApp.",
  },
  {
    question: "What do I need to get started?",
    answer:
      "Just a short conversation about your business. If you have a logo and photos, great. If not, we help you with that too.",
  },
];

export const contactFaqs: Faq[] = [
  {
    question: "What happens after I send this form?",
    answer:
      "You get an email from us straight away. If your project looks like a good fit, you can book a call right on the next screen. We reply on WhatsApp too.",
  },
  ...workFaqs.slice(0, 4),
  {
    question: "Who will I be talking to?",
    answer:
      "You speak directly with Tapiwa, the founder. He builds the projects himself, so nothing gets lost between a sales person and a developer.",
  },
];

export const projectFaqs: Faq[] = workFaqs.filter((f) =>
  [
    "What does \"pay only when you love it\" really mean?",
    "How much will it cost?",
    "How long does it take?",
    "Will it work on phones and slow internet?",
  ].includes(f.question)
);
