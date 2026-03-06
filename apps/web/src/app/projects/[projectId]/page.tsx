import Link from "next/link";
import { notFound } from "next/navigation";

import { createCueAction } from "@/app/actions";
import { cueArchetypeOptions, cueArchetypeProfiles } from "@/lib/cue-archetypes";
import { getProjectWithCues } from "@/lib/store";

export const dynamic = "force-dynamic";

const reviewTone = {
  draft: "border-white/12 bg-white/8 text-slate-200",
  shortlisted: "border-cyan-300/30 bg-cyan-400/10 text-cyan-50",
  approved: "border-emerald-300/30 bg-emerald-400/10 text-emerald-50",
  rejected: "border-rose-300/30 bg-rose-400/10 text-rose-50",
} as const;

const energyLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
} as const;

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const project = await getProjectWithCues(projectId);

  if (!project) {
    notFound();
  }

  return (
    <main className="px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm text-slate-200 transition hover:border-amber-300/40 hover:bg-white/6"
          >
            <span aria-hidden>?</span>
            Dashboard
          </Link>
          <a
            href="https://suno.com/create"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
          >
            Open Suno Create
          </a>
        </div>

        <section className="rounded-[30px] border border-white/10 bg-slate-950/68 p-6 shadow-2xl shadow-black/30 backdrop-blur md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-200/70">
                Project workspace
              </p>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-stone-50 sm:text-5xl">
                  {project.name}
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
                  {project.description ||
                    "No project overview yet. Add concrete cue briefs so the music direction stays consistent."}
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Cue briefs
                </p>
                <p className="mt-3 text-4xl font-semibold text-stone-50">
                  {project.cueCount}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Engine
                </p>
                <p className="mt-3 text-2xl font-semibold text-stone-50 uppercase">
                  {project.engineTarget}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Licensing
                </p>
                <p className="mt-3 text-2xl font-semibold text-stone-50 uppercase">
                  {project.licensingTarget}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <aside className="rounded-[28px] border border-white/10 bg-stone-100/[0.06] p-6 shadow-xl shadow-black/20 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-200/70">
              New cue
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-50">
              Add a gameplay music brief
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Keep it concrete. Scene, mood, energy, pacing, and loop behavior are
              what make the Suno handoff useful.
            </p>

            <form action={createCueAction} className="mt-6 space-y-4">
              <input type="hidden" name="projectId" value={project.id} />

              <label className="block">
                <span className="text-sm font-medium text-stone-100">Cue name</span>
                <input
                  name="name"
                  required
                  placeholder="Corridor Ambush"
                  className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/55"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-stone-100">Scene brief</span>
                <textarea
                  name="sceneDescription"
                  required
                  rows={4}
                  placeholder="What is happening in the game when this cue plays?"
                  className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/55"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-stone-100">Cue archetype</span>
                  <select
                    name="cueArchetype"
                    defaultValue="custom"
                    className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-300/55"
                  >
                    {cueArchetypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-stone-100">Mood</span>
                  <input
                    name="mood"
                    defaultValue="focused, atmospheric"
                    className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-300/55"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-stone-100">Energy</span>
                  <select
                    name="energyLevel"
                    defaultValue="medium"
                    className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-300/55"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-stone-100">Tempo hint</span>
                  <input
                    name="tempoHint"
                    defaultValue="around 100 BPM"
                    className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-300/55"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-stone-100">Target length (sec)</span>
                  <input
                    name="durationTargetSec"
                    type="number"
                    min={30}
                    max={600}
                    defaultValue={120}
                    className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-300/55"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-stone-100">Primary instruments</span>
                <input
                  name="primaryInstruments"
                  placeholder="synth pulse, brushed drums, low strings"
                  className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/55"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-stone-100">Avoid terms</span>
                <input
                  name="avoidTerms"
                  placeholder="EDM drops, comedy accents, vocal chops"
                  className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/55"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-stone-100">Reference notes</span>
                <textarea
                  name="referenceNotes"
                  rows={4}
                  placeholder="How should the cue behave in the middle, ending, or transition points?"
                  className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/55"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="loopRequired"
                    defaultChecked
                    className="h-4 w-4 rounded border-white/20 bg-slate-950/60 text-amber-300"
                  />
                  Loop-friendly structure
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="instrumentalOnly"
                    defaultChecked
                    className="h-4 w-4 rounded border-white/20 bg-slate-950/60 text-amber-300"
                  />
                  Instrumental only
                </label>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
              >
                Create cue and open prompt package
              </button>
            </form>
          </aside>

          <section className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
                  Existing cues
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-50">
                  Review and refine the current queue
                </h2>
              </div>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100">
                {project.cueCount} briefs
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {project.cues.map((cue) => (
                <Link
                  key={cue.id}
                  href={`/projects/${project.id}/cues/${cue.id}`}
                  className="block rounded-[24px] border border-white/10 bg-white/[0.045] p-5 transition hover:-translate-y-0.5 hover:border-amber-300/35 hover:bg-white/[0.07]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-stone-50">{cue.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {cueArchetypeProfiles[cue.cueArchetype].label} · {energyLabels[cue.energyLevel]} energy · {cue.durationTargetSec}s target
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.24em] ${reviewTone[cue.reviewState]}`}
                    >
                      {cue.reviewState}
                    </span>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-300">
                    {cue.sceneDescription}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                    <span>{cueArchetypeProfiles[cue.cueArchetype].label}</span>
                    <span>•</span>
                    <span>{cue.instrumentalOnly ? "Instrumental" : "Vocals allowed"}</span>
                    <span>•</span>
                    <span>{cue.loopRequired ? "Loop-aware" : "Full ending"}</span>
                    <span>•</span>
                    <span>Updated {formatDate(cue.updatedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

