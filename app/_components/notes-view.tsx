"use client";

import { useEffect, useRef, useState } from "react";

export function NotesView() {
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/notes");
        if (!res.ok) throw new Error("Failed to fetch notes");
        const data = await res.json();
        setNotes(data.notes || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load notes");
        console.error("Error fetching notes:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchNotes();
  }, []);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);

    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }

    notesTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: newNotes }),
        });

        if (!res.ok) {
          throw new Error("Failed to save notes");
        }
      } catch (err) {
        console.error("Error saving notes:", err);
        setError("Failed to save notes. Please try again.");
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[500px]">
      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-100 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}
      <textarea
        value={notes}
        onChange={handleNotesChange}
        placeholder="Write your notes here..."
        className="h-[600px] w-full resize-none rounded-[28px] border border-lime-200 bg-lime-50/35 p-5 text-black shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-lime-400 focus:ring-4 focus:ring-lime-200/70 dark:border-lime-900/50 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-lime-400 dark:focus:ring-lime-400/10"
      />
    </div>
  );
}
