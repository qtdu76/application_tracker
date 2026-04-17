export default function PrivacyPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-zinc-50 px-4 py-12 text-zinc-900 dark:bg-black dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
            Privacy
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Application Tracker stores the information you choose to add so you can manage your
            applications, contacts, notes, and documents.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Your Data</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            The app stores application details, contact records, freeform notes, and uploaded
            documents in the configured Supabase project.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Access</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Tracker data is associated with your signed-in account. Supabase Row Level Security is
            used so users can access only their own tracker records.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Documents</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Uploaded CVs, cover letters, and related files may contain personal information. Only
            upload documents you are comfortable storing in your configured Supabase Storage bucket.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Self-Hosting</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            If you self-host this app, you are responsible for your own Supabase project, hosting
            environment, access settings, backups, and data retention choices.
          </p>
        </section>
      </div>
    </div>
  );
}
