"use client";

import { useState } from "react";
import { Badge, Modal } from "@/components/ui";
import type { Lesson } from "@/lib/academy";

export function AcademyList({ lessons }: { lessons: Lesson[] }) {
  const [open, setOpen] = useState<Lesson | null>(null);
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lessons.map((l) => (
          <button key={l.slug} onClick={() => setOpen(l)} className="card p-5 text-left hover:border-brand-500/40 transition flex flex-col">
            <div className="flex items-center justify-between">
              <Badge tone={l.level === "Beginner" ? "success" : l.level === "Intermediate" ? "info" : "warning"}>{l.level}</Badge>
              <span className="text-xs text-ink-400">{l.minutes} min</span>
            </div>
            <h3 className="mt-3 font-display font-semibold text-white">{l.title}</h3>
            <p className="mt-1.5 text-sm text-ink-300 line-clamp-3">{l.summary}</p>
          </button>
        ))}
      </div>
      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title={open?.title ?? ""} wide>
        {open && (
          <article className="space-y-4 text-sm text-ink-200 leading-relaxed">
            {open.body.map((p, i) =>
              p.startsWith("## ") ? (
                <h4 key={i} className="font-display font-semibold text-white pt-2">{p.slice(3)}</h4>
              ) : (
                <p key={i}>{p}</p>
              ),
            )}
          </article>
        )}
      </Modal>
    </>
  );
}
