import { BookOpen, Clock } from "lucide-react";
import { PageHeader } from "@/components/app/shell";
import { LESSONS } from "@/lib/academy";
import { AcademyList } from "./academy-list";

export default function AcademyPage() {
  return (
    <>
      <PageHeader title="Academy" text="Short, practical lessons on investing, mining and staying safe with digital assets." />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {[
          { icon: BookOpen, v: LESSONS.length, l: "Lessons" },
          { icon: Clock, v: LESSONS.reduce((s, x) => s + x.minutes, 0), l: "Minutes of reading" },
          { icon: BookOpen, v: new Set(LESSONS.map((x) => x.level)).size, l: "Levels" },
        ].map((s) => (
          <div key={s.l} className="card p-5 flex items-center gap-4">
            <span className="size-10 rounded-xl bg-brand-500/15 text-brand-300 grid place-items-center"><s.icon className="size-5" /></span>
            <div>
              <p className="font-display text-xl font-semibold text-white">{s.v}</p>
              <p className="text-xs text-ink-400">{s.l}</p>
            </div>
          </div>
        ))}
      </div>
      <AcademyList lessons={LESSONS} />
    </>
  );
}
