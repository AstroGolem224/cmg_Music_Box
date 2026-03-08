"use client";

import { useEffect, useState } from "react";

import { CopyTextButton } from "@/components/copy-text-button";
import { cueArchetypeOptions, cueArchetypeProfiles } from "@/lib/cue-archetypes";
import { createCue, createProject, getCueById, getProjectWithCues, listProjects, loadDatabase, saveDatabase, updateCue } from "@/lib/browser-store";
import { buildPromptPackage, SUNO_DESCRIPTION_MAX_LENGTH, SUNO_STYLE_MAX_LENGTH, SUNO_WRITE_LYRICS_MAX_LENGTH } from "@/lib/prompt-builder";
import type { CueArchetype, DatabaseShape, ReviewState } from "@/lib/types";

type Route = { view: "home" } | { view: "project"; projectId: string } | { view: "cue"; projectId: string; cueId: string };

const card = "rounded-[14px] border border-[color:var(--border)] bg-[color:var(--bg-card)] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.28)]";
const tabButton = "rounded-[8px] border border-[color:var(--border-glow)] px-4 py-2 font-[family:var(--font-display)] text-[13px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)] transition hover:border-[color:var(--cyan)] hover:text-[color:var(--foreground)]";
const primaryButton = "rounded-[8px] bg-gradient-to-br from-[color:var(--ember)] to-[color:var(--ember-dark)] px-4 py-2 font-[family:var(--font-display)] text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition hover:opacity-90";
const inputClass = "rounded-[8px] border border-[color:var(--border)] bg-[color:var(--bg-input)] px-4 py-3 text-[14px] outline-none transition focus:border-[color:var(--cyan)]";
const sectionTitle = "font-[family:var(--font-display)] text-[13px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]";

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
  return (
    <main className="mx-auto flex max-w-[980px] flex-col gap-6 px-5 py-6 sm:px-8">
      <header className="mb-2 flex items-center gap-4">
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[8px] bg-gradient-to-br from-[color:var(--ember)] to-[color:var(--ember-dark)] font-[family:var(--font-display)] text-[18px] font-bold tracking-[0.05em] text-white">
          MB
        </div>
        <div>
          <p className="font-[family:var(--font-display)] text-[28px] font-bold uppercase tracking-[0.08em] text-[color:var(--foreground)]">
            Music <span className="text-[color:var(--ember)]">Box</span>
          </p>
          <p className="text-sm text-[color:var(--text-muted)]">
            soundforge-aligned UI for cue planning and Suno handoff
          </p>
        </div>
      </header>
      {children}
    </main>
  );
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
    if (!project) return shell(<section className={card}><p>project not found.</p><button type="button" onClick={openHome} className={`mt-4 ${primaryButton}`}>dashboard</button></section>);

    return shell(
      <>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={openHome} className={tabButton}>dashboard</button>
          <a href="https://suno.com/create" target="_blank" rel="noreferrer" className={primaryButton}>open suno</a>
        </div>
        <section className={card}>
          <p className={sectionTitle}>project workspace</p>
          <h1 className="mt-2 font-[family:var(--font-display)] text-5xl font-bold uppercase tracking-[0.04em] text-[color:var(--foreground)]">{project.name}</h1>
          <p className="mt-3 text-[color:var(--foreground)]/85">{project.description || "no project brief yet."}</p>
          <p className="mt-4 text-sm text-slate-400">{project.engineTarget} · {project.licensingTarget} · {project.cueCount} cues</p>
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          <form className={card} onSubmit={(event) => { event.preventDefault(); const fd = new FormData(event.currentTarget); const result = createCue(db, { projectId: project.id, name: text(fd, "name", "Untitled Cue"), cueArchetype: text(fd, "cueArchetype", "custom") as CueArchetype, sceneDescription: text(fd, "sceneDescription"), mood: text(fd, "mood", "focused, atmospheric"), energyLevel: text(fd, "energyLevel", "medium") as "low" | "medium" | "high", tempoHint: text(fd, "tempoHint", "around 100 BPM"), durationTargetSec: num(fd, "durationTargetSec", 120), loopRequired: bool(fd, "loopRequired"), instrumentalOnly: bool(fd, "instrumentalOnly"), primaryInstruments: text(fd, "primaryInstruments"), avoidTerms: text(fd, "avoidTerms"), referenceNotes: text(fd, "referenceNotes") }); setDb(result.database); const next = { view: "cue", projectId: project.id, cueId: result.cue.id } as const; setRoute(next); go(next); }}>
            <h2 className="text-2xl font-semibold text-stone-50">new cue</h2>
            <div className="mt-4 grid gap-3">
              <input name="name" required placeholder="corridor ambush" className={inputClass} />
              <textarea name="sceneDescription" required rows={4} placeholder="what happens in-game?" className={inputClass} />
              <select name="cueArchetype" defaultValue="custom" className={inputClass}>{cueArchetypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
              <input name="mood" defaultValue="focused, atmospheric" className={inputClass} />
              <div className="grid gap-3 sm:grid-cols-2">
                <select name="energyLevel" defaultValue="medium" className={inputClass}><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select>
                <input name="tempoHint" defaultValue="around 100 BPM" className={inputClass} />
              </div>
              <input name="durationTargetSec" type="number" min={30} max={600} defaultValue={120} className={inputClass} />
              <input name="primaryInstruments" placeholder="primary instruments" className={inputClass} />
              <input name="avoidTerms" placeholder="avoid terms" className={inputClass} />
              <textarea name="referenceNotes" rows={3} placeholder="reference notes" className={inputClass} />
              <label className="flex gap-2 text-sm text-[color:var(--text-muted)]"><input type="checkbox" name="loopRequired" defaultChecked />loop-friendly</label>
              <label className="flex gap-2 text-sm text-[color:var(--text-muted)]"><input type="checkbox" name="instrumentalOnly" defaultChecked />instrumental only</label>
              <button type="submit" className={primaryButton}>create cue</button>
            </div>
          </form>
          <section className={card}>
            <p className={sectionTitle}>existing cues</p>
            <h2 className="mt-2 font-[family:var(--font-display)] text-3xl font-bold uppercase tracking-[0.05em] text-[color:var(--foreground)]">cue queue</h2>
            <div className="mt-4 space-y-3">
              {project.cues.map((cue) => (
                <button key={cue.id} type="button" onClick={() => { const next = { view: "cue", projectId: project.id, cueId: cue.id } as const; setRoute(next); go(next); }} className="block w-full rounded-[8px] border border-[color:var(--border)] bg-[color:var(--bg-input)] p-4 text-left transition hover:border-[color:var(--border-glow)]">
                  <div className="flex items-start justify-between gap-3"><strong className="font-[family:var(--font-display)] text-xl font-semibold uppercase tracking-[0.04em] text-[color:var(--foreground)]">{cue.name}</strong><span className="text-xs uppercase text-[color:var(--text-muted)]">{cue.reviewState}</span></div>
                  <p className="mt-2 text-sm text-[color:var(--foreground)]/85">{cue.sceneDescription}</p>
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
    if (!project || !cue || cue.projectId !== project.id) return shell(<section className={card}><p>cue not found.</p><button type="button" onClick={openHome} className={`mt-4 ${primaryButton}`}>dashboard</button></section>);
    const promptPackage = buildPromptPackage(project, cue);

    return shell(
      <>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={openHome} className={tabButton}>dashboard</button>
          <button type="button" onClick={() => { const next = { view: "project", projectId: project.id } as const; setRoute(next); go(next); }} className={tabButton}>project</button>
          <a href="https://suno.com/create" target="_blank" rel="noreferrer" className={primaryButton}>open suno</a>
        </div>
        <section className="grid gap-6 lg:grid-cols-2">
          <form className={card} onSubmit={(event) => { event.preventDefault(); const fd = new FormData(event.currentTarget); const result = updateCue(db, { cueId: cue.id, name: text(fd, "name", cue.name), cueArchetype: text(fd, "cueArchetype", cue.cueArchetype) as CueArchetype, sceneDescription: text(fd, "sceneDescription"), mood: text(fd, "mood", cue.mood), energyLevel: text(fd, "energyLevel", cue.energyLevel) as "low" | "medium" | "high", tempoHint: text(fd, "tempoHint", cue.tempoHint), durationTargetSec: num(fd, "durationTargetSec", cue.durationTargetSec), loopRequired: bool(fd, "loopRequired"), instrumentalOnly: bool(fd, "instrumentalOnly"), primaryInstruments: text(fd, "primaryInstruments"), avoidTerms: text(fd, "avoidTerms"), referenceNotes: text(fd, "referenceNotes"), reviewState: text(fd, "reviewState", cue.reviewState) as ReviewState }); if (result) setDb(result.database); }}>
            <p className={sectionTitle}>cue editor</p>
            <h1 className="mt-2 font-[family:var(--font-display)] text-4xl font-bold uppercase tracking-[0.04em] text-[color:var(--foreground)]">{cue.name}</h1>
            <div className="mt-4 grid gap-3">
              <input name="name" defaultValue={cue.name} className={inputClass} />
              <textarea name="sceneDescription" rows={4} defaultValue={cue.sceneDescription} className={inputClass} />
              <select name="cueArchetype" defaultValue={cue.cueArchetype} className={inputClass}>{cueArchetypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
              <input name="mood" defaultValue={cue.mood} className={inputClass} />
              <div className="grid gap-3 sm:grid-cols-2">
                <select name="energyLevel" defaultValue={cue.energyLevel} className={inputClass}><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select>
                <input name="tempoHint" defaultValue={cue.tempoHint} className={inputClass} />
              </div>
              <input name="durationTargetSec" type="number" min={30} max={600} defaultValue={cue.durationTargetSec} className={inputClass} />
              <input name="primaryInstruments" defaultValue={cue.primaryInstruments} className={inputClass} />
              <input name="avoidTerms" defaultValue={cue.avoidTerms} className={inputClass} />
              <textarea name="referenceNotes" rows={3} defaultValue={cue.referenceNotes} className={inputClass} />
              <select name="reviewState" defaultValue={cue.reviewState} className={inputClass}><option value="draft">draft</option><option value="shortlisted">shortlisted</option><option value="approved">approved</option><option value="rejected">rejected</option></select>
              <label className="flex gap-2 text-sm text-[color:var(--text-muted)]"><input type="checkbox" name="loopRequired" defaultChecked={cue.loopRequired} />loop-friendly</label>
              <label className="flex gap-2 text-sm text-[color:var(--text-muted)]"><input type="checkbox" name="instrumentalOnly" defaultChecked={cue.instrumentalOnly} />instrumental only</label>
              <button type="submit" className={primaryButton}>save cue</button>
            </div>
          </form>
          <section className={card}>
            <p className={sectionTitle}>suno package</p>
            <h2 className="mt-2 font-[family:var(--font-display)] text-4xl font-bold uppercase tracking-[0.04em] text-[color:var(--foreground)]">{promptPackage.title}</h2>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">{SUNO_DESCRIPTION_MAX_LENGTH} / {SUNO_STYLE_MAX_LENGTH} / {SUNO_WRITE_LYRICS_MAX_LENGTH} suno limits</p>
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
        <p className={sectionTitle}>CMG Music Box</p>
        <h1 className="mt-4 max-w-3xl font-[family:var(--font-display)] text-6xl font-bold uppercase tracking-[0.04em] text-[color:var(--foreground)]">plan game music, then hand it off to suno without losing context.</h1>
        <p className="mt-4 max-w-2xl text-[color:var(--foreground)]/85">this pages-safe build stores data in your browser. github pages stays static; your workflow stays usable.</p>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <div className="flex items-center justify-between gap-3"><div><p className={sectionTitle}>workspace</p><h2 className="mt-2 font-[family:var(--font-display)] text-3xl font-bold uppercase tracking-[0.05em] text-[color:var(--foreground)]">projects</h2></div><a href="https://suno.com/create" target="_blank" rel="noreferrer" className={tabButton}>open suno</a></div>
          <div className="mt-4 space-y-3">
            {projects.map((project) => (
              <button key={project.id} type="button" onClick={() => { const next = { view: "project", projectId: project.id } as const; setRoute(next); go(next); }} className="block w-full rounded-[8px] border border-[color:var(--border)] bg-[color:var(--bg-input)] p-4 text-left transition hover:border-[color:var(--border-glow)]">
                <div className="flex items-start justify-between gap-3"><strong className="font-[family:var(--font-display)] text-xl font-semibold uppercase tracking-[0.04em] text-[color:var(--foreground)]">{project.name}</strong><span className="text-xs text-[color:var(--text-muted)]">{project.cueCount} cues</span></div>
                <p className="mt-2 text-sm text-[color:var(--foreground)]/85">{project.description || "no project brief yet."}</p>
                <p className="mt-2 text-xs text-slate-500">{project.engineTarget} · {project.licensingTarget}</p>
              </button>
            ))}
          </div>
        </section>
        <form className={card} onSubmit={(event) => { event.preventDefault(); const fd = new FormData(event.currentTarget); const result = createProject(db, { name: text(fd, "name", "Untitled Project"), description: text(fd, "description"), engineTarget: text(fd, "engineTarget", "godot") as "godot" | "unity" | "unreal", licensingTarget: text(fd, "licensingTarget", "commercial") as "commercial" | "prototype" }); setDb(result.database); const next = { view: "project", projectId: result.project.id } as const; setRoute(next); go(next); }}>
          <p className={sectionTitle}>new project</p>
          <h2 className="mt-2 font-[family:var(--font-display)] text-3xl font-bold uppercase tracking-[0.05em] text-[color:var(--foreground)]">start score pipeline</h2>
          <div className="mt-4 grid gap-3">
            <input name="name" required placeholder="starfall tactics" className={inputClass} />
            <textarea name="description" rows={5} placeholder="game brief" className={inputClass} />
            <select name="engineTarget" defaultValue="godot" className={inputClass}><option value="godot">Godot</option><option value="unity">Unity</option><option value="unreal">Unreal</option></select>
            <select name="licensingTarget" defaultValue="commercial" className={inputClass}><option value="commercial">Commercial</option><option value="prototype">Prototype</option></select>
            <button type="submit" className={primaryButton}>create project</button>
          </div>
        </form>
      </section>
    </>,
  );
}
