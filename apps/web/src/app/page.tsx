import Link from "next/link";

import { createProjectAction } from "@/app/actions";
import { listProjects } from "@/lib/store";

export const dynamic = "force-dynamic";

const engineLabels = {
  godot: "Godot",
  unity: "Unity",
  unreal: "Unreal",
} as const;

const licensingLabels = {
  commercial: "Commercial-ready",
  prototype: "Prototype-only",
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function HomePage() {
  const projects = await listProjects();
  const totalCues = projects.reduce((sum, project) => sum + project.cueCount, 0);
  const commercialProjects = projects.filter(
    (project) => project.licensingTarget === "commercial",
  ).length;

  return (
    <main className="px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/30 backdrop-blur md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/70">
                CMG Music Box
              </p>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-stone-50 sm:text-5xl">
                  Plan game music like a producer, then hand it off to Suno without losing context.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  This MVP focuses on the durable part of the workflow: cue briefs,
                  repeatable prompt packages, and a clean manual Suno handoff.
                  Full automation stays optional until the provider layer is stable.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2">
                  Prompt system
                </span>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2">
                  Cue workflow
                </span>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2">
                  Manual Suno provider
                </span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Projects
                </p>
                <p className="mt-3 text-4xl font-semibold text-stone-50">
                  {projects.length}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Cue briefs
                </p>
                <p className="mt-3 text-4xl font-semibold text-stone-50">
                  {totalCues}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Commercial targets
                </p>
                <p className="mt-3 text-4xl font-semibold text-stone-50">
                  {commercialProjects}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-black/20 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Active projects
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-50">
                  Current game music workbench
                </h2>
              </div>
              <a
                className="rounded-full border border-white/12 px-4 py-2 text-sm text-slate-200 transition hover:border-amber-300/40 hover:bg-white/6"
                href="https://suno.com/create"
                target="_blank"
                rel="noreferrer"
              >
                Open Suno Create
              </a>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group rounded-[24px] border border-white/10 bg-white/[0.045] p-5 transition hover:-translate-y-0.5 hover:border-amber-300/35 hover:bg-white/[0.07]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-stone-50 transition group-hover:text-amber-100">
                        {project.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {engineLabels[project.engineTarget]} · {licensingLabels[project.licensingTarget]}
                      </p>
                    </div>
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-100">
                      {project.cueCount} cues
                    </span>
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">
                    {project.description ||
                      "No project brief yet. Start by adding one concrete cue request."}
                  </p>
                  <p className="mt-5 text-xs uppercase tracking-[0.24em] text-slate-500">
                    Updated {formatDate(project.updatedAt)}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <aside className="rounded-[28px] border border-white/10 bg-stone-100/[0.06] p-6 shadow-xl shadow-black/20 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/70">
              New project
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-50">
              Start a fresh score pipeline
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Create the game container first. Cue briefs, prompt packages, and
              later exports all stay attached to this project.
            </p>

            <form action={createProjectAction} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-stone-100">Project name</span>
                <input
                  name="name"
                  required
                  placeholder="Starfall Tactics"
                  className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/55"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-stone-100">Game brief</span>
                <textarea
                  name="description"
                  rows={5}
                  placeholder="Core fantasy, world tone, genre, and how music should support the game."
                  className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/55"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-stone-100">Engine target</span>
                  <select
                    name="engineTarget"
                    defaultValue="godot"
                    className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-300/55"
                  >
                    <option value="godot">Godot</option>
                    <option value="unity">Unity</option>
                    <option value="unreal">Unreal</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-stone-100">Licensing target</span>
                  <select
                    name="licensingTarget"
                    defaultValue="commercial"
                    className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-300/55"
                  >
                    <option value="commercial">Commercial release</option>
                    <option value="prototype">Prototype / internal</option>
                  </select>
                </label>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01]"
              >
                Create project workspace
              </button>
            </form>
          </aside>
        </section>
      </div>
    </main>
  );
}

