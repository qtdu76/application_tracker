"use client";

import { useEffect, useRef, useState } from "react";
import type { Application } from "@/types/application";
import {
  MdAdd,
  MdContentCopy,
  MdDelete,
  MdEmail,
  MdExpandLess,
  MdExpandMore,
  MdLaunch,
  MdPhone,
  MdWork,
} from "react-icons/md";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

type ContactPatch = Partial<Pick<Contact, "name" | "email" | "phone" | "linkedin" | "company" | "notes">>;
type ContactTextField = "name" | "email" | "phone" | "linkedin" | "company";

interface WebsiteDetails {
  origin: string;
  hostname: string;
}

function getWebsiteDetails(website: string | null): WebsiteDetails | null {
  if (!website) {
    return null;
  }

  const trimmedWebsite = website.trim();
  if (!trimmedWebsite) {
    return null;
  }

  try {
    const normalizedWebsite = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmedWebsite)
      ? trimmedWebsite
      : `https://${trimmedWebsite}`;
    const url = new URL(normalizedWebsite);

    return {
      origin: url.origin,
      hostname: url.hostname.replace(/^www\./i, ""),
    };
  } catch {
    return null;
  }
}

function getFaviconSources(website: string | null): string[] {
  const websiteDetails = getWebsiteDetails(website);
  if (!websiteDetails) {
    return [];
  }

  const domain = encodeURIComponent(websiteDetails.hostname);

  return [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `${websiteDetails.origin}/favicon.ico`,
  ];
}

function FaviconImage({ sources }: { sources: string[] }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const source = sources[sourceIndex];

  if (!source) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={source}
      alt=""
      className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-xl object-contain"
      onError={(event) => {
        if (sourceIndex < sources.length - 1) {
          setSourceIndex((currentIndex) => currentIndex + 1);
        } else {
          event.currentTarget.style.display = "none";
        }
      }}
    />
  );
}

function ContactCompanyMark({ company, website }: { company: string | null; website: string | null }) {
  const faviconSources = getFaviconSources(website);
  const initial = company?.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-amber-50 text-sm font-semibold text-amber-700 ring-1 ring-inset ring-amber-100 dark:bg-zinc-800 dark:text-amber-300 dark:ring-zinc-700">
      <span>{initial}</span>
      <FaviconImage key={faviconSources.join("|")} sources={faviconSources} />
    </div>
  );
}

interface ContactsViewProps {
  applications?: Application[];
  initialCompany?: string | null;
  onInitialCompanyConsumed?: () => void;
  initialContactId?: string | null;
  onInitialContactConsumed?: () => void;
}

export function ContactsView({
  applications = [],
  initialCompany = null,
  onInitialCompanyConsumed,
  initialContactId = null,
  onInitialContactConsumed,
}: ContactsViewProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedContacts, setExpandedContacts] = useState<Set<string>>(new Set());
  const [focusedContactId, setFocusedContactId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    company: "",
    notes: "",
  });
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});
  const contactsRef = useRef<Contact[]>([]);
  const notesTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    void fetchContacts();
  }, []);

  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);

  useEffect(() => {
    if (!initialCompany) {
      return;
    }

    setFormData({
      name: "",
      email: "",
      phone: "",
      linkedin: "",
      company: initialCompany,
      notes: "",
    });
    setShowModal(true);
    onInitialCompanyConsumed?.();
  }, [initialCompany, onInitialCompanyConsumed]);

  useEffect(() => {
    if (!initialContactId || contacts.length === 0) {
      return;
    }

    const contactExists = contacts.some((contact) => contact.id === initialContactId);
    if (!contactExists) {
      return;
    }

    setFocusedContactId(initialContactId);
    setExpandedContacts((currentExpandedContacts) => {
      const nextExpandedContacts = new Set(currentExpandedContacts);
      nextExpandedContacts.add(initialContactId);
      return nextExpandedContacts;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document
          .getElementById(`application-tracker-contact-${initialContactId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });

    onInitialContactConsumed?.();
  }, [contacts, initialContactId, onInitialContactConsumed]);

  const companyNames = Array.from(
    new Set(
      applications
        .map((application) => application.company.trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const applicationsByCompany = applications.reduce<Record<string, Application[]>>(
    (result, application) => {
      const key = application.company.trim().toLowerCase();
      if (!key) {
        return result;
      }
      result[key] = [...(result[key] || []), application];
      return result;
    },
    {},
  );

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/contacts");
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data = await res.json();
      contactsRef.current = data;
      setContacts(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load contacts");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const toggleContact = (contactId: string) => {
    if (focusedContactId === contactId) {
      setFocusedContactId(null);
    }

    const nextExpanded = new Set(expandedContacts);
    if (nextExpanded.has(contactId)) {
      nextExpanded.delete(contactId);
    } else {
      nextExpanded.add(contactId);
    }
    setExpandedContacts(nextExpanded);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const resetContactModal = () => {
    setShowModal(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      linkedin: "",
      company: "",
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (!formData.name.trim()) {
        setError("Name is required");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          linkedin: formData.linkedin.trim() || null,
          company: formData.company.trim() || null,
          notes: formData.notes.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create contact");

      resetContactModal();
      await fetchContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save contact");
    } finally {
      setLoading(false);
    }
  };

  const saveContactPatch = async (contact: Contact, patch: ContactPatch) => {
    const currentContact = contactsRef.current.find((savedContact) => savedContact.id === contact.id) || contact;
    const nextContact = { ...currentContact, ...patch };
    const nextName = nextContact.name.trim();

    if (!nextName) {
      setError("Name is required");
      return null;
    }

    const normalizeOptional = (value: string | null) => value?.trim() || null;

    try {
      setError(null);
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nextName,
          email: normalizeOptional(nextContact.email),
          phone: normalizeOptional(nextContact.phone),
          linkedin: normalizeOptional(nextContact.linkedin),
          company: normalizeOptional(nextContact.company),
          notes: normalizeOptional(nextContact.notes),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update contact: ${res.status} ${res.statusText}`);
      }

      const result = await res.json();
      contactsRef.current = contactsRef.current.map((currentContact) =>
        currentContact.id === contact.id ? result : currentContact,
      );
      setContacts((currentContacts) =>
        currentContacts.map((currentContact) =>
          currentContact.id === contact.id ? result : currentContact,
        ),
      );
      return result as Contact;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update contact");
      return null;
    }
  };

  const saveTextFieldOnBlur = (contact: Contact, field: ContactTextField, value: string) => {
    const nextValue = field === "name" ? value.trim() : value.trim() || null;

    if (field === "name" && !nextValue) {
      setError("Name is required");
      return;
    }

    if (contact[field] === nextValue) {
      return;
    }

    void saveContactPatch(contact, { [field]: nextValue } as ContactPatch);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete contact");
      await fetchContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete contact");
    } finally {
      setLoading(false);
    }
  };

  const handleNotesChange = (contactId: string, notes: string) => {
    setEditingNotes({ ...editingNotes, [contactId]: notes });

    if (notesTimeoutRef.current[contactId]) {
      clearTimeout(notesTimeoutRef.current[contactId]);
    }

    notesTimeoutRef.current[contactId] = setTimeout(async () => {
      try {
        const contact = contacts.find((currentContact) => currentContact.id === contactId);
        if (!contact) return;

        const result = await saveContactPatch(contact, { notes: notes.trim() || null });
        if (!result) return;

        setEditingNotes((currentNotes) => {
          const nextEditingNotes = { ...currentNotes };
          delete nextEditingNotes[contactId];
          return nextEditingNotes;
        });
      } catch (err) {
        console.error("Failed to update notes:", err);
        setError(err instanceof Error ? err.message : "Failed to update notes");
      }
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center py-12 text-zinc-600 dark:text-zinc-400">
        Loading contacts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-300 bg-red-100 p-3 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-[500px]">
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-amber-400 dark:bg-amber-300 dark:hover:bg-amber-200"
        >
          <MdAdd className="text-xl" />
          Add Contact
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-100 p-3 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-800 hover:underline dark:text-red-300"
          >
            Dismiss
          </button>
        </div>
      )}

      <datalist id="application-tracker-contact-company-options">
        {companyNames.map((company) => (
          <option key={company} value={company} />
        ))}
      </datalist>

      {contacts.length === 0 ? (
        <div className="flex min-h-[500px] items-center justify-center py-12 text-center text-zinc-600 dark:text-zinc-400">
          No contacts yet. Click &quot;Add Contact&quot; to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => {
            const isFocused = focusedContactId === contact.id;
            const isExpanded = isFocused || expandedContacts.has(contact.id);
            const linkedApplications = contact.company
              ? applicationsByCompany[contact.company.trim().toLowerCase()] || []
              : [];
            const linkedCompanyWebsite = linkedApplications.find((application) => application.website)?.website || null;
            const contactActions = [
              contact.email
                ? {
                    label: "Email",
                    value: contact.email,
                    icon: <MdEmail className="text-lg" />,
                    href: `mailto:${contact.email}`,
                    onAction: () => void copyToClipboard(contact.email!),
                  }
                : null,
              contact.phone
                ? {
                    label: "Phone",
                    value: contact.phone,
                    icon: <MdPhone className="text-lg" />,
                    href: `tel:${contact.phone}`,
                    onAction: () => void copyToClipboard(contact.phone!),
                  }
                : null,
              contact.linkedin
                ? {
                    label: "LinkedIn",
                    value: contact.linkedin,
                    icon: <MdLaunch className="text-lg" />,
                    href: contact.linkedin,
                    onAction: () => void copyToClipboard(contact.linkedin!),
                  }
                : null,
            ].filter(Boolean) as {
              label: string;
              value: string;
              icon: React.ReactNode;
              href: string;
              onAction: () => void;
            }[];

            return (
              <div
                key={contact.id}
                id={`application-tracker-contact-${contact.id}`}
                className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:border-amber-200 dark:bg-zinc-900 dark:hover:border-amber-800/70 ${
                  isFocused
                    ? "border-amber-300 ring-4 ring-amber-100 dark:border-amber-700 dark:ring-amber-900/30"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div
                  className="cursor-pointer p-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  onClick={() => toggleContact(contact.id)}
                >
                  <div className="flex items-start gap-4">
                    <ContactCompanyMark company={contact.company || contact.name} website={linkedCompanyWebsite} />
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                          {contact.name}
                        </h3>
                      </div>
                      {contact.company ? (
                        <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-2xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 ring-1 ring-inset ring-amber-100 dark:bg-amber-950/30 dark:text-amber-200 dark:ring-amber-900/60">
                          <span className="truncate">{contact.company}</span>
                          {linkedApplications.length > 0 ? (
                            <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-zinc-900 dark:text-amber-200">
                              {linkedApplications.length}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <button className="shrink-0 rounded-full p-2 text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                      {isExpanded ? <MdExpandLess className="text-xl" /> : <MdExpandMore className="text-xl" />}
                    </button>
                  </div>
                </div>
                {isExpanded ? (
                  <div className="border-t border-amber-100 bg-amber-50/35 p-5 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                      <div className="space-y-5">
                        <div>
                          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                            Contact Details
                          </h4>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                                Name
                              </label>
                              <input
                                type="text"
                                defaultValue={contact.name}
                                onBlur={(event) => saveTextFieldOnBlur(contact, "name", event.currentTarget.value)}
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-white dark:focus:ring-white/10"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                                Company
                              </label>
                              <input
                                type="text"
                                defaultValue={contact.company || ""}
                                list="application-tracker-contact-company-options"
                                onBlur={(event) => saveTextFieldOnBlur(contact, "company", event.currentTarget.value)}
                                placeholder="Company"
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white dark:focus:ring-white/10"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                                Email
                              </label>
                              <input
                                type="email"
                                defaultValue={contact.email || ""}
                                onBlur={(event) => saveTextFieldOnBlur(contact, "email", event.currentTarget.value)}
                                placeholder="name@example.com"
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white dark:focus:ring-white/10"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                                Phone
                              </label>
                              <input
                                type="tel"
                                defaultValue={contact.phone || ""}
                                onBlur={(event) => saveTextFieldOnBlur(contact, "phone", event.currentTarget.value)}
                                placeholder="+44..."
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white dark:focus:ring-white/10"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                                LinkedIn
                              </label>
                              <input
                                type="url"
                                defaultValue={contact.linkedin || ""}
                                onBlur={(event) => saveTextFieldOnBlur(contact, "linkedin", event.currentTarget.value)}
                                placeholder="https://linkedin.com/in/..."
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white dark:focus:ring-white/10"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                            Notes
                          </h4>
                          <textarea
                            value={editingNotes[contact.id] !== undefined ? editingNotes[contact.id] : (contact.notes || "")}
                            onChange={(e) => handleNotesChange(contact.id, e.target.value)}
                            onFocus={() => {
                              if (editingNotes[contact.id] === undefined) {
                                setEditingNotes({ ...editingNotes, [contact.id]: contact.notes || "" });
                              }
                            }}
                            placeholder="Add notes about this contact..."
                            className="min-h-[130px] w-full resize-y rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-black outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white dark:focus:ring-white/10"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 rounded-3xl border border-amber-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                        <div>
                          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                            Quick Actions
                          </h4>
                          {contactActions.length > 0 ? (
                            <div className="grid gap-2">
                              {contactActions.map((action) => (
                                <div
                                  key={action.label}
                                  className="flex min-w-0 items-center gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-950"
                                >
                                  <a
                                    href={action.href}
                                    target={action.label === "LinkedIn" ? "_blank" : undefined}
                                    rel={action.label === "LinkedIn" ? "noopener noreferrer" : undefined}
                                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                  >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-zinc-700 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-800">
                                      {action.icon}
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                                        {action.label}
                                      </span>
                                      <span className="mt-1 block truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {action.value}
                                      </span>
                                    </span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={action.onAction}
                                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                                    title={`Copy ${action.label}`}
                                  >
                                    <MdContentCopy />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                              Add email, phone, or LinkedIn details to create shortcuts.
                            </p>
                          )}
                        </div>

                        <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                            Linked Applications
                          </h4>
                          {linkedApplications.length > 0 ? (
                            <div className="grid gap-2">
                              {linkedApplications.map((application) => (
                                <div
                                  key={application.id}
                                  className="flex min-w-0 items-center gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-950"
                                >
                                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                    <MdWork className="text-lg" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                      {application.role || application.company}
                                    </span>
                                    <span className="mt-1 block truncate text-xs text-zinc-500 dark:text-zinc-400">
                                      {application.company}
                                    </span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                              No linked applications yet.
                            </p>
                          )}
                        </div>

                        <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                          <button
                            type="button"
                            onClick={() => void handleDelete(contact.id)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/60 dark:bg-zinc-900 dark:text-red-300 dark:hover:bg-red-950/40"
                          >
                            <MdDelete className="text-base" />
                            Delete Contact
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {showModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={resetContactModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="mb-4 text-2xl font-semibold text-black dark:text-zinc-50">
                Add New Contact
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-md border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-md border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full rounded-md border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    list="application-tracker-contact-company-options"
                    className="w-full rounded-md border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    placeholder="Acme Inc."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full rounded-md border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    placeholder="Add any notes about this contact..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-500 disabled:bg-zinc-400"
                  >
                    {loading ? "Saving..." : "Create Contact"}
                  </button>
                  <button
                    type="button"
                    onClick={resetContactModal}
                    className="rounded-md bg-zinc-200 px-4 py-2 text-black transition hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
