import { ChevronDown } from "lucide-react";

import { getStorefrontTexts, type StorefrontTextKey } from "@/lib/storefront-text";
import { safeJsonLd } from "@/lib/utils";

const FAQ_ITEMS: { question: StorefrontTextKey; answer: StorefrontTextKey }[] = [
  { question: "homepage.faq1Question", answer: "homepage.faq1Answer" },
  { question: "homepage.faq2Question", answer: "homepage.faq2Answer" },
  { question: "homepage.faq3Question", answer: "homepage.faq3Answer" },
  { question: "homepage.faq4Question", answer: "homepage.faq4Answer" },
  { question: "homepage.faq5Question", answer: "homepage.faq5Answer" },
];

export async function FaqSection() {
  const texts = await getStorefrontTexts();

  const items = FAQ_ITEMS.map((item) => ({
    question: texts[item.question].trim(),
    answer: texts[item.answer].trim(),
  })).filter((item) => item.question && item.answer);

  if (items.length === 0) return null;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />
      <h2 className="font-heading text-2xl font-medium sm:text-3xl">
        {texts["homepage.faqHeading"]}
      </h2>

      <div className="mt-8 border-t border-border">
        {items.map((item) => (
          <details key={item.question} className="group border-b border-border">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
              {item.question}
              <ChevronDown
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
