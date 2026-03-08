"use client";

import { useEffect, useState } from "react";

import { CopyTextButton } from "@/components/copy-text-button";
import { cueArchetypeOptions, cueArchetypeProfiles } from "@/lib/cue-archetypes";
import { createCue, createProject, getCueById, getProjectWithCues, listProjects, loadDatabase, saveDatabase, updateCue } from "@/lib/browser-store";
import { buildPromptPackage, SUNO_DESCRIPTION_MAX_LENGTH, SUNO_STYLE_MAX_LENGTH, SUNO_WRITE_LYRICS_MAX_LENGTH } from "@/lib/prompt-builder";
import type { CueArchetype, DatabaseShape, ReviewState } from "@/lib/types";

type Route = { view: "home" } | { view: "project"; projectId: string } | { view: "cue"; projectId: string; cueId: string };

const card = "rounded-3xl border border-white/10 bg-slate-950/65 p-6 shadow-xl shadow-black/20";

function parseRoute(): Route {
  if (typeof window === "undefined") return { view: "home" };
  const parts = window.location.hash.replace(/^#/, "").split("/").filter(Boolean);
  if (parts[0] === "projects" && parts[1] && parts[2] === "cues" && parts[3]) return { view: "cue", projectId: parts[1], cueId: parts[3] };
  if (parts[0] === "projects" && parts[1]) return { view: "project", projectId: parts[1] };
  return { view: "home" };
}

function go(route: Route) {
  if (typeof window === "undefined") return;
  window.location.hash = route.view === "home" ? "/" : route.view === "project" ? `/projects/${route.projectId}` : `/projects/${route.projectId}/cues/${route.cueId}`;
}

function text(fd: FormData, key: string, fallback = "") {
  const value = fd.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

function bool(fd: FormData, key: string) {
  return fd.get(key) === "on";
}

function num(fd: FormData, key: string, fallback: number) {
  const value = Number(text(fd, key, String(fallback)));
  return Number.isNaN(value) ? fallback : Math.max(30, Math.min(600, Math.round(value)));
}

function shell(children: React.ReactNode) {
  return <main className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">{children}</main>;
}

export function MusicBoxApp() {
  const [db, setDb] = useState<DatabaseShape | null>(null);
  const [route, setRoute] = useState<Route>({ view: "home" });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDb(loadDatabase());
      setRoute(parseRoute());
    });
    const onHash = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHash);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  useEffect(() => {
    if (db) saveDatabase(db);
  }, [db]);

  if (!db) return shell(<section className={card}>loading local workspace...</section>);

  const projects = listProjects(db);
  const openHome = () => {
    const next = { view: "home" } as const;
    setRoute(next);
    go(next);
  };

  if (route.view === "project") {
    const project = getProjectWithCues(db, route.projectId);
    if (!project) return shell(<section className={card}><p>project not found.</p><button type="button" onClick={openHome} className="mt-4 rounded-full bg-amber-400 px-4 py-2 text-slate-950">dashboard</button></section>);

    return shell(
      <>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={openHome} className="rounded-full border border-white/15 px-4 py-2 text-sm">dashboard</button>
          <a href="https://suno.com/create" target="_blank" rel="noreferrer" className="rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-4 py-2 text-sm font-semibold text-slate-950">open suno</a>
        </div>
        <section className={card}>
          <h1 className="text-4xl font-semibold text-stone-50">{project.name}</h1>
          <p className="mt-3 text-slate-300">{project.description || "no project brief yet."}</p>
          <p className="mt-4 text-sm text-slate-400">{project.engineTarget} · {project.licensingTarget} · {project.cueCount} cues</p>
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          <form className={card} onSubmit={(event) => { event.preventDefault(); const fd = new FormData(event.currentTarget); const result = createCue(db, { projectId: project.id, name: text(fd, "name", "Untitled Cue"), cueArchetype: text(fd, "cueArchetype", "custom") as CueArchetype, sceneDescription: text(fd, "sceneDescription"), mood: text(fd, "mood", "focused, atmospheric"), energyLevel: text(fd, "energyLevel", "medium") as "low" | "medium" | "high", tempoHint: text(fd, "tempoHint", "around 100 BPM"), durationTargetSec: num(fd, "durationTargetSec", 120), loopRequired: bool(fd, "loopRequired"), instrumentalOnly: bool(fd, "instrumentalOnly"), primaryInstruments: text(fd, "primaryInstruments"), avoidTerms: text(fd, "avoidTerms"), referenceNotes: text(fd, "referenceNotes") }); setDb(result.database); const next = { view: "cue", projectId: project.id, cueId: result.cue.id } as const; setRoute(next); go(next); }}>
            <h2 className="text-2xl font-semibold text-stone-50">new cue</h2>
            <div className="mt-4 grid gap-3">
              <input name="name" required placeholder="corridor ambush" className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
              <textarea name="sceneDescription" required rows={4} placeholder="what happens in-game?" className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
              <select name="cueArchetype" defaultValue="custom" className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3">{cueArchetypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
              <input name="mood" defaultValue="focused, atmospheric" className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
              <div className="grid gap-3 sm:grid-cols-2">
                <select name="energyLevel" defaultValue="medium" className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3"><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select>
                <input name="tempoHint" defaultValue="around 100 BPM" className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
              </div>
              <input name="durationTargetSec" type="number" min={30} max={600} defaultValue={120} className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
              <input name="primaryInstruments" placeholder="primary instruments" className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
              <input name="avoidTerms" placeholder="avoid terms" className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
              <textarea name="referenceNotes" rows={3} placeholder="reference notes" className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
              <label className="flex gap-2"><input type="checkbox" name="loopRequired" defaultChecked />loop-friendly</label>
              <label className="flex gap-2"><input type="checkbox" name="instrumentalOnly" defaultChecked />instrumental only</label>
              <button type="submit" className="rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-3 font-semibold text-slate-950">create cue</button>
            </div>
          </form>
          <section className={card}>
            <h2 className="text-2xl font-semibold text-stone-50">cues</h2>
            <div className="mt-4 space-y-3">
              {project.cues.map((cue) => (
                <button key={cue.id} type="button" onClick={() => { const next = { view: "cue", projectId: project.id, cueId: cue.id } as const; setRoute(next); go(next); }} className="block w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                  <div className="flex items-start justify-between gap-3"><strong className="text-stone-50">{cue.name}</strong><span className="text-xs uppercase text-slate-400">{cue.reviewState}</span></div>
                  <p className="mt-2 text-sm text-slate-300">{cue.sceneDescription}</p>
                  <p className="mt-2 text-xs text-slate-500">{cueArchetypeProfiles[cue.cueArchetype].label} · {cue.energyLevel} · {cue.durationTargetSec}s</p>
                </button>
              ))}
            </div>
          </section>
        </section>
      </>,
    );
  }

  if (route.view === "cue") {
    const project = getProjectWithCues(db, route.projectId);
    const cue = getCueById(db, route.cueId);
    if (!project || !cue || cue.projectId !== project.id) return shell(<section className={card}><p>cue not found.</p><button type="button" onClick={openHome} className="mt-4 rounded-full bg-amber-400 px-4 py-2 text-slate-950">dashboard</button></section>);
    const promptPackage = buildPromptPackage(project, cue);

    return shell(
      <>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={openHome} className="rounded-full border border-white/15 px-4 py-2 text-sm">dashboard</button>
          <button type="button" onClick={() => { const next = { view: "project", projectId: project.id } as const; setRoute(next); go(next); }} className="rounded-full border border-white/15 px-4 py-2 text-sm">project</button>
          <a href="https://suno.com/create" target="_blank" rel="noreferrer" className="rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-4 py-2 text-sm font-semibold text-slate-950">open suno</a>
        </div>
        <section className="grid gap-6 lg:grid-cols-2">
          <form className={card} onSubmit={(event) => { event.preventDefault(); const fd = new FormData(event.currentTarget); const result = updateCue(db, { cueId: cue.id, name: text(fd, "name", cue.name), cueArchetype: text(fd, "cueArchetype", cue.cueArchetype) as CueArchetype, sceneDescription: text(fd, "sceneDescription"), mood: text(fd, "mood", cue.mood), energyLevel: text(fd, "energyLevel", cue.energyLevel) as "low" | "medium" | "high", tempoHint: text(fd, "tempoHint", cue.tempoHint), durationTargetSec: num(fd, "durationTargetSec", cue.durationTargetSec), loopRequired: bool(fd, "loopRequired"), instrumentalOnly: bool(fd, "instrumentalOnly"), primaryInstruments: text(fd, "primaryInstruments"), avoidTerms: text(fd, "avoidTerms"), referenceNotes: text(fd, "referenceNotes"), reviewState: text(fd, "reviewState", cue.reviewState) as ReviewState }); if (result) setDb(result.database); }}>
            <h1 className="text-3xl font-semibold text-stone-50">{cue.name}</h1>
            <div className="mt-4 grid gap-3">
              <input name="name" defaultValue={cue.name} className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
              <textarea name="sceneDescription" rows={4} defaultValue={cue.sceneDescription} className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
              <select name="cueArchetype" defaultValue={cue.cueArchetype} className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3">{cueArchetypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
              <input name="mood" defaultValue={cue.mood} className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
              <div className="grid gap-3 sm:grid-cols-2">
                <select name="energyLevel" defaultValue={cue.energyLevel} className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3"><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select>
                <input name="tempoHint" defaultValue={cue.tempoHint} className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
              </div>
              <input name="durationTargetSec" type="number" min={30} max={600} defaultValue={cue.durationTargetSec} className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
              <input name="primaryInstruments" defaultValue={cue.primaryInstruments} className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
              <input name="avoidTerms" defaultValue={cue.avoidTerms} className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
              <textarea name="referenceNotes" rows={3} defaultValue={cue.referenceNotes} className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
              <select name="reviewState" defaultValue={cue.reviewState} className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3"><option value="draft">draft</option><option value="shortlisted">shortlisted</option><option value="approved">approved</option><option value="rejected">rejected</option></select>
              <label className="flex gap-2"><input type="checkbox" name="loopRequired" defaultChecked={cue.loopRequired} />loop-friendly</label>
              <label className="flex gap-2"><input type="checkbox" name="instrumentalOnly" defaultChecked={cue.instrumentalOnly} />instrumental only</label>
              <button type="submit" className="rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-3 font-semibold text-slate-950">save cue</button>
            </div>
          </form>
          <section className={card}>
            <h2 className="text-2xl font-semibold text-stone-50">{promptPackage.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{SUNO_DESCRIPTION_MAX_LENGTH} / {SUNO_STYLE_MAX_LENGTH} / {SUNO_WRITE_LYRICS_MAX_LENGTH} suno limits</p>
            <div className="mt-4 space-y-4">
              <div><div className="mb-2 flex items-center justify-between"><strong>Description</strong><CopyTextButton label="copy description" text={promptPackage.descriptionPrompt} /></div><pre className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-900 p-4 text-sm text-slate-200">{promptPackage.descriptionPrompt}</pre></div>
              <div><div className="mb-2 flex items-center justify-between"><strong>Style</strong><CopyTextButton label="copy style" text={promptPackage.stylePrompt} /></div><pre className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-900 p-4 text-sm text-slate-200">{promptPackage.stylePrompt}</pre></div>
              <div><div className="mb-2 flex items-center justify-between"><strong>Producer brief</strong><CopyTextButton label="copy brief" text={promptPackage.producerBrief} /></div><pre className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-900 p-4 text-sm text-slate-200">{promptPackage.producerBrief}</pre></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-300">{promptPackage.engineNote}</p></div>
            </div>
          </section>
        </section>
      </>,
    );
  }

  return shell(
    <>
      <section className={card}>
        <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">CMG Music Box</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-stone-50">plan game music, then hand it off to suno without losing context.</h1>
        <p className="mt-4 max-w-2xl text-slate-300">this pages-safe build stores data in your browser. github pages stays static; your workflow stays usable.</p>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-semibold text-stone-50">projects</h2><a href="https://suno.com/create" target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-2 text-sm">open suno</a></div>
          <div className="mt-4 space-y-3">
            {projects.map((project) => (
              <button key={project.id} type="button" onClick={() => { const next = { view: "project", projectId: project.id } as const; setRoute(next); go(next); }} className="block w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                <div className="flex items-start justify-between gap-3"><strong className="text-stone-50">{project.name}</strong><span className="text-xs text-slate-400">{project.cueCount} cues</span></div>
                <p className="mt-2 text-sm text-slate-300">{project.description || "no project brief yet."}</p>
                <p className="mt-2 text-xs text-slate-500">{project.engineTarget} · {project.licensingTarget}</p>
              </button>
            ))}
          </div>
        </section>
        <form className={card} onSubmit={(event) => { event.preventDefault(); const fd = new FormData(event.currentTarget); const result = createProject(db, { name: text(fd, "name", "Untitled Project"), description: text(fd, "description"), engineTarget: text(fd, "engineTarget", "godot") as "godot" | "unity" | "unreal", licensingTarget: text(fd, "licensingTarget", "commercial") as "commercial" | "prototype" }); setDb(result.database); const next = { view: "project", projectId: result.project.id } as const; setRoute(next); go(next); }}>
          <h2 className="text-2xl font-semibold text-stone-50">new project</h2>
          <div className="mt-4 grid gap-3">
            <input name="name" required placeholder="starfall tactics" className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
            <textarea name="description" rows={5} placeholder="game brief" className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3" />
            <select name="engineTarget" defaultValue="godot" className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3"><option value="godot">Godot</option><option value="unity">Unity</option><option value="unreal">Unreal</option></select>
            <select name="licensingTarget" defaultValue="commercial" className="rounded-2xl border border-white/12 bg-slate-900 px-4 py-3"><option value="commercial">Commercial</option><option value="prototype">Prototype</option></select>
            <button type="submit" className="rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-5 py-3 font-semibold text-slate-950">create project</button>
          </div>
        </form>
      </section>
    </>,
  );
}
