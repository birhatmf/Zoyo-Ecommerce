import { getStorefrontTexts, type StorefrontTextKey } from "@/lib/storefront-text";

// "Nasıl üretiyoruz" süreç adımları. Metinler admin panelinden yönetilir.
const STEPS: { title: StorefrontTextKey; description: StorefrontTextKey }[] = [
  { title: "homepage.process1Title", description: "homepage.process1Desc" },
  { title: "homepage.process2Title", description: "homepage.process2Desc" },
  { title: "homepage.process3Title", description: "homepage.process3Desc" },
  { title: "homepage.process4Title", description: "homepage.process4Desc" },
];

export async function ProcessSection() {
  const texts = await getStorefrontTexts();

  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <h2 className="font-heading text-2xl font-medium sm:text-3xl">
          {texts["homepage.processHeading"]}
        </h2>

        <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-t border-border pt-5">
              <span
                aria-hidden="true"
                className="font-heading text-2xl font-medium text-accent"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-base font-medium">{texts[step.title]}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {texts[step.description]}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
