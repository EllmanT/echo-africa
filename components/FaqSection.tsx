import JsonLd from "@/components/seo/JsonLd";
import { buildFAQSchema } from "@/lib/seo/structured-data";
import type { Faq } from "@/data/faqs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FaqSection = ({
  faqs,
  heading = "Questions people ask us",
  id = "faq",
}: {
  faqs: Faq[];
  heading?: string;
  id?: string;
}) => (
  <section id={id} aria-labelledby={`${id}-heading`} className="mx-auto w-full max-w-3xl py-20 md:py-28">
    <JsonLd data={buildFAQSchema(faqs)} />
    <h2 id={`${id}-heading`} className="heading">
      {heading}
    </h2>
    <Accordion type="single" collapsible className="mt-10 border-t border-black/[0.08]">
      {faqs.map((faq) => (
        <AccordionItem key={faq.question} value={faq.question}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </section>
);

export default FaqSection;
