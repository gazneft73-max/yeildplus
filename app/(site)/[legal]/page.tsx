import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEGAL_PAGES } from "@/lib/legal";

export function generateStaticParams() {
  return Object.keys(LEGAL_PAGES).map((legal) => ({ legal }));
}

export async function generateMetadata({ params }: PageProps<"/[legal]">): Promise<Metadata> {
  const { legal } = await params;
  const page = LEGAL_PAGES[legal];
  return { title: page?.title ?? "Legal" };
}

export default async function LegalPage({ params }: PageProps<"/[legal]">) {
  const { legal } = await params;
  const page = LEGAL_PAGES[legal];
  if (!page) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 pt-32 pb-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Legal</p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-white">{page.title}</h1>
      <p className="mt-2 text-sm text-ink-400">Last updated {page.updated}</p>
      <div className="mt-10 space-y-8">
        {page.sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-xl font-semibold text-white">{s.h}</h2>
            {s.p.map((t, i) => (
              <p key={i} className="mt-3 text-ink-300 leading-relaxed">
                {t}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
