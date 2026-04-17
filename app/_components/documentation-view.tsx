export function DocumentationView() {
  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-indigo-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Tracker guide
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Use the tracker to keep one clean record of every application, then move into notes or
          contacts when you need deeper context.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[28px] border border-cyan-100 bg-cyan-50/35 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
            Stages
          </div>
          <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
            <div><span className="font-semibold">Not Applied:</span> opportunities you want to review or tailor for.</div>
            <div><span className="font-semibold">Applied:</span> applications you have already submitted.</div>
            <div><span className="font-semibold">Interview:</span> live processes with calls, tasks, or interviews underway.</div>
            <div><span className="font-semibold">Offer:</span> opportunities that have moved into offer stage.</div>
            <div><span className="font-semibold">Pending:</span> applications waiting on a decision or next step.</div>
            <div><span className="font-semibold">Rejected:</span> closed applications kept for reference.</div>
          </div>
        </div>

        <div className="rounded-[28px] border border-amber-100 bg-amber-50/35 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
            Mobile workflow
          </div>
          <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
            <div>Start from the menu page and open the section or stage you need.</div>
            <div>Use the filters drawer when you need to narrow the list without filling the screen.</div>
            <div>Keep cards collapsed for scanning, then expand one only when you need notes, attachments, or actions.</div>
            <div>Use reorder mode on the menu page to move the sections you use most near the top.</div>
          </div>
        </div>

        <div className="rounded-[28px] border border-lime-100 bg-lime-50/35 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-lime-700 dark:text-lime-300">
            Notes
          </div>
          <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            Use the notes page for broader reflections, prep lists, follow-up ideas, or anything
            that does not belong to a single application.
          </p>
        </div>

        <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/35 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
            Contacts
          </div>
          <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            Store recruiters, hiring managers, alumni, and networking contacts separately so they
            remain reusable across multiple applications.
          </p>
        </div>
      </div>
    </div>
  );
}
