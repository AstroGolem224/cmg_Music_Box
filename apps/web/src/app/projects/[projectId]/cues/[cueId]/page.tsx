import Link from "next/link";
import { notFound } from "next/navigation";

import { updateCueAction } from "@/app/actions";
import { CopyTextButton } from "@/components/copy-text-button";
import { cueArchetypeOptions, cueArchetypeProfiles } from "@/lib/cue-archetypes";
import {
  buildPromptPackage,
  SUNO_DESCRIPTION_MAX_LENGTH,
  SUNO_STYLE_MAX_LENGTH,
  SUNO_WRITE_LYRICS_MAX_LENGTH,
} from "@/lib/prompt-builder";
import { getCueById, getProjectWithCues } from "@/lib/store";

export const dynamic = "force-dynamic";

const reviewTone = {
  draft: "border-white/12 bg-white/8 text-slate-200",
  shortlisted: "border-cyan-300/30 bg-cyan-400/10 text-cyan-50",
  approved: "border-emerald-300/30 bg-emerald-400/10 text-emerald-50",
  rejected: "border-rose-300/30 bg-rose-400/10 text-rose-50",
} as const;

type CuePageProps = {
  params: Promise<{ projectId: string; cueId: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function CuePage({ params }: CuePageProps) {
  const { projectId, cueId } = await params;
  const [project, cue] = await Promise.all([
    getProjectWithCues(projectId),
    getCueById(cueId),
  ]);

  if (!project || !cue || cue.projectId !== project.id) {
    notFound();
  }

  const promptPackage = buildPromptPackage(project, cue);

  return (
    <main className="px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 transition hover:border-amber-300/40 hover:bg-white/6"
            >
              <span aria-hidden>?</span>
              Dashboard
            </Link>
            <Link
              href={`/projects/${project.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 transition hover:border-amber-300/40 hover:bg-white/6"
            >
              Project cues
            </Link>
          </div>
          <a
            href="https://suno.com/create"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
          >
            Open Suno Create
          </a>
        </div>

        <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <form
            action={updateCueAction}
            className="rounded-[28px] border border-white/10 bg-stone-100/[0.06] p-6 shadow-xl shadow-black/20 backdrop-blur"
          >
            <input type="hidden" name="projectId" value={project.id} />
            <input type="hidden" name="cueId" value={cue.id} />

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-200/70">
                  Cue editor
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-stone-50">
                  {cue.name}
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                  {cueArchetypeProfiles[cue.cueArchetype].label} archetype · Last updated {formatDate(cue.updatedAt)}
                </p>
              </div>
              <span
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.26em] ${reviewTone[cue.reviewState]}`}
              >
                {cue.reviewState}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-stone-100">Cue name</span>
                <input
                  name="name"
                  defaultValue={cue.name}
                  className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-300/55"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-stone-100">Scene brief</span>
                <textarea
                  name="sceneDescription"
                  rows={5}
                  defaultValue={cue.sceneDescription}
                  className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-300/55"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-stone-100">Cue archetype</span>
                  <select
                    name="cueArchetype"
                    defaultValue={cue.cueArchetype}
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
                    defaultValue={cue.mood}
                    className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-300/55"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-stone-100">Review state</span>
                  <select
                    name="reviewState"
                    defaultValue={cue.reviewState}
                    className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-300/55"
                  >
                    <option value="draft">Draft</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-stone-100">Energy</span>
                  <select
                    name="energyLevel"
                    defaultValue={cue.energyLevel}
                    className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-300/55"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-stone-100">Tempo hint</span>
                  <input
                    name="tempoHint"
                    defaultValue={cue.tempoHint}
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
                    defaultValue={cue.durationTargetSec}
                    className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-300/55"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-stone-100">Primary instruments</span>
                <input
                  name="primaryInstruments"
                  defaultValue={cue.primaryInstruments}
                  className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-300/55"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-stone-100">Avoid terms</span>
                <input
                  name="avoidTerms"
                  defaultValue={cue.avoidTerms}
                  className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-300/55"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-stone-100">Reference notes</span>
                <textarea
                  name="referenceNotes"
                  rows={4}
                  defaultValue={cue.referenceNotes}
                  className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-300/55"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="loopRequired"
                    defaultChecked={cue.loopRequired}
                    className="h-4 w-4 rounded border-white/20 bg-slate-950/60 text-amber-300"
                  />
                  Loop-friendly structure
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    name="instrumentalOnly"
                    defaultChecked={cue.instrumentalOnly}
                    className="h-4 w-4 rounded border-white/20 bg-slate-950/60 text-amber-300"
                  />
                  Instrumental only
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
            >
              Save cue brief
            </button>
          </form>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-white/10 bg-slate-950/65 p-6 shadow-xl shadow-black/20 backdrop-blur">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">
                    Suno package
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-stone-50">
                    {promptPackage.title}
                  </h2>
                </div>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.26em] text-cyan-100">
                  Manual provider
                </span>
              </div>

              <div className="mt-6 rounded-[22px] border border-amber-300/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50">
                <p className="font-medium text-amber-100">Verified Suno field limits</p>
                <p className="mt-2">
                  Describe your lyrics: {SUNO_DESCRIPTION_MAX_LENGTH} chars. Enter style tags: {SUNO_STYLE_MAX_LENGTH} chars. Write Lyrics: {SUNO_WRITE_LYRICS_MAX_LENGTH} chars.
                </p>
                <p className="mt-2">
                  Archetype: {cueArchetypeProfiles[cue.cueArchetype].label}. Role: {cueArchetypeProfiles[cue.cueArchetype].gameplayRole}
                </p>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div className="rounded-[22px] border border-white/10 bg-slate-900/90 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-stone-100">Description field</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">
                        Paste into: Describe your lyrics
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="shrink-0 whitespace-nowrap rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-slate-200">
                        {promptPackage.descriptionPrompt.length} / {SUNO_DESCRIPTION_MAX_LENGTH}
                      </span>
                      <CopyTextButton
                        label="Copy text"
                        text={promptPackage.descriptionPrompt}
                      />
                    </div>
                  </div>
                  <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-slate-200">
                    {promptPackage.descriptionPrompt}
                  </pre>
                </div>

                <div className="rounded-[22px] border border-white/10 bg-slate-900/90 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-stone-100">Style field</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">
                        Paste into: Enter style tags
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="shrink-0 whitespace-nowrap rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-slate-200">
                        {promptPackage.stylePrompt.length} / {SUNO_STYLE_MAX_LENGTH}
                      </span>
                      <CopyTextButton label="Copy text" text={promptPackage.stylePrompt} />
                    </div>
                  </div>
                  <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-slate-200">
                    {promptPackage.stylePrompt}
                  </pre>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-stone-100">Style keywords</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {promptPackage.styleKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-stone-100">Internal producer brief</p>
                  <CopyTextButton label="Copy brief" text={promptPackage.producerBrief} />
                </div>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {promptPackage.producerBrief}
                </pre>
              </div>

              <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
                <p className="text-sm font-medium text-stone-100">Engine note</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {promptPackage.engineNote}
                </p>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-stone-100/[0.06] p-6 shadow-xl shadow-black/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-200/70">
                Manual Suno handoff
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-50">
                Run this cue in Suno with minimal drift
              </h2>
              <ol className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                {promptPackage.handoffSteps.map((step) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-xs font-semibold text-amber-100">
                      •
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://suno.com/create"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
                >
                  Open Suno Create
                </a>
                <Link
                  href={`/projects/${project.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-white/12 px-5 py-3 text-sm font-medium text-stone-100 transition hover:border-amber-300/40 hover:bg-white/6"
                >
                  Back to cue list
                </Link>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-black/20 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-200/70">
                Release checks
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-50">
                Before you approve this cue
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                {promptPackage.releaseChecklist.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
