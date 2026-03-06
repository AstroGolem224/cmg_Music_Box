import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-slate-950/70 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/70">
          Missing route
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-stone-50">
          That project or cue does not exist.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          The local datastore could not find the requested record. Return to the
          dashboard and pick an existing project.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full border border-white/12 px-5 py-3 text-sm font-medium text-stone-100 transition hover:border-amber-300/40 hover:bg-white/6"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}

