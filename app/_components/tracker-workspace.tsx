"use client";

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import type { Application, ApplicationStatus, ApplicationUpdate, Attachment, CompanyType } from "@/types/application";
import {
  MdAdd,
  MdAttachFile,
  MdDelete,
  MdEmail,
  MdExpandLess,
  MdExpandMore,
  MdGridView,
  MdKeyboardArrowDown,
  MdLaunch,
  MdPhone,
  MdPersonAdd,
  MdViewList,
} from "react-icons/md";
import type { StageFilter, TrackerDisplayMode } from "../tracker-types";

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

function CompanyMark({ company, website }: { company: string; website: string | null }) {
  const faviconSources = getFaviconSources(website);
  const initial = company.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 text-sm font-semibold text-zinc-600 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">
      <span>{initial}</span>
      <FaviconImage key={faviconSources.join("|")} sources={faviconSources} />
    </div>
  );
}

function SelectArrow() {
  return (
    <MdKeyboardArrowDown
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-zinc-400 dark:text-zinc-500"
    />
  );
}

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

function getStageChipClasses(stage: StageFilter, isActive: boolean): string {
  const colors: Record<StageFilter, { active: string; inactive: string; countActive: string; countInactive: string }> = {
    not_applied: {
      active: "bg-teal-600 text-white dark:bg-teal-300 dark:text-zinc-950",
      inactive: "bg-white text-zinc-600 ring-1 ring-inset ring-teal-100 hover:bg-teal-50 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-teal-900/50 dark:hover:bg-teal-950/30",
      countActive: "bg-white/20 text-white dark:bg-zinc-950/10 dark:text-zinc-950",
      countInactive: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300",
    },
    applied: {
      active: "bg-cyan-500 text-zinc-950 dark:bg-cyan-300 dark:text-zinc-950",
      inactive: "bg-cyan-50 text-cyan-800 ring-1 ring-inset ring-cyan-100 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-200 dark:ring-cyan-800/60 dark:hover:bg-cyan-900/50",
      countActive: "bg-zinc-950/10 text-zinc-950",
      countInactive: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-200",
    },
    interview: {
      active: "bg-amber-400 text-zinc-950 dark:bg-amber-300 dark:text-zinc-950",
      inactive: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-100 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800/60 dark:hover:bg-amber-900/50",
      countActive: "bg-zinc-950/10 text-zinc-950",
      countInactive: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200",
    },
    pending: {
      active: "bg-orange-500 text-white dark:bg-orange-400 dark:text-zinc-950",
      inactive: "bg-orange-50 text-orange-800 ring-1 ring-inset ring-orange-100 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-200 dark:ring-orange-800/60 dark:hover:bg-orange-900/50",
      countActive: "bg-white/20 text-white dark:bg-zinc-950/10 dark:text-zinc-950",
      countInactive: "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-200",
    },
    offer: {
      active: "bg-lime-500 text-zinc-950 dark:bg-lime-300 dark:text-zinc-950",
      inactive: "bg-lime-50 text-lime-800 ring-1 ring-inset ring-lime-100 hover:bg-lime-100 dark:bg-lime-950/40 dark:text-lime-200 dark:ring-lime-800/60 dark:hover:bg-lime-900/50",
      countActive: "bg-zinc-950/10 text-zinc-950",
      countInactive: "bg-lime-100 text-lime-700 dark:bg-lime-900/60 dark:text-lime-200",
    },
    successful: {
      active: "bg-emerald-500 text-zinc-950 dark:bg-emerald-300 dark:text-zinc-950",
      inactive: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-100 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800/60 dark:hover:bg-emerald-900/50",
      countActive: "bg-zinc-950/10 text-zinc-950",
      countInactive: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200",
    },
    rejected: {
      active: "bg-red-500 text-white dark:bg-red-400 dark:text-zinc-950",
      inactive: "bg-red-50 text-red-800 ring-1 ring-inset ring-red-100 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-800/60 dark:hover:bg-red-900/50",
      countActive: "bg-white/20 text-white dark:bg-zinc-950/10 dark:text-zinc-950",
      countInactive: "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200",
    },
    all: {
      active: "bg-indigo-600 text-white dark:bg-indigo-300 dark:text-zinc-950",
      inactive: "bg-white text-zinc-600 ring-1 ring-inset ring-indigo-100 hover:bg-indigo-50 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-indigo-900/50 dark:hover:bg-indigo-950/30",
      countActive: "bg-white/20 text-white dark:bg-zinc-950/15 dark:text-zinc-950",
      countInactive: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300",
    },
  };

  const selected = colors[stage];
  return isActive ? selected.active : selected.inactive;
}

function getStageCountClasses(stage: StageFilter, isActive: boolean): string {
  const colors: Record<StageFilter, { active: string; inactive: string }> = {
    not_applied: { active: "bg-white/20 text-white dark:bg-zinc-950/10 dark:text-zinc-950", inactive: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-200" },
    applied: { active: "bg-zinc-950/10 text-zinc-950", inactive: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-200" },
    interview: { active: "bg-zinc-950/10 text-zinc-950", inactive: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200" },
    pending: { active: "bg-white/20 text-white dark:bg-zinc-950/10 dark:text-zinc-950", inactive: "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-200" },
    offer: { active: "bg-zinc-950/10 text-zinc-950", inactive: "bg-lime-100 text-lime-700 dark:bg-lime-900/60 dark:text-lime-200" },
    successful: { active: "bg-zinc-950/10 text-zinc-950", inactive: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200" },
    rejected: { active: "bg-white/20 text-white dark:bg-zinc-950/10 dark:text-zinc-950", inactive: "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200" },
    all: { active: "bg-white/20 text-white dark:bg-zinc-950/15 dark:text-zinc-950", inactive: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200" },
  };

  const selected = colors[stage];
  return isActive ? selected.active : selected.inactive;
}

interface TrackerWorkspaceProps {
  loading: boolean;
  applications: Application[];
  filteredApplications: Application[];
  expandedRows: Set<string>;
  editingAppNotes: { [key: string]: string };
  setEditingAppNotes: Dispatch<SetStateAction<{ [key: string]: string }>>;
  uploadingAttachment: string | null;
  statusCounts: {
    not_applied: number;
    applied: number;
    interview: number;
    offer: number;
    successful: number;
    pending: number;
    rejected: number;
    all: number;
  };
  statusFilter: StageFilter;
  setStatusFilter: (value: StageFilter) => void;
  typeFilter: CompanyType | "all";
  setTypeFilter: (value: CompanyType | "all") => void;
  industryFilter: string;
  setIndustryFilter: (value: string) => void;
  locationFilter: string;
  setLocationFilter: (value: string) => void;
  deadlineFilter: string;
  setDeadlineFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  uniqueIndustries: string[];
  industryMap: Map<string, string>;
  uniqueLocations: string[];
  locationMap: Map<string, string>;
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: Dispatch<SetStateAction<boolean>>;
  activeFilterCount: number;
  trackerDisplayMode: TrackerDisplayMode;
  setTrackerDisplayMode: (value: TrackerDisplayMode) => void;
  onAdd: () => void;
  onDelete: (applicationId: string) => void;
  onToggleRow: (applicationId: string) => void;
  onStatusChange: (applicationId: string, status: ApplicationStatus) => void;
  onApplicationFieldChange: (applicationId: string, patch: ApplicationUpdate) => void;
  onAddContact: (application: Application) => void;
  onOpenContact: (contactId: string) => void;
  onAttachmentUpload: (applicationId: string, file: File, type: "cv" | "cover_letter" | "other") => void;
  onAttachmentDelete: (applicationId: string, attachmentId: string) => void;
  onAppNotesChange: (applicationId: string, notes: string) => void;
  formatStageLabel: (stage: StageFilter) => string;
  getStatusColor: (status: ApplicationStatus) => string;
  formatStatus: (status: ApplicationStatus) => string;
  getDeadlineStatus: (deadline: string | null) => "past" | "urgent" | "upcoming" | null;
}

export function TrackerWorkspace({
  loading,
  applications,
  filteredApplications,
  expandedRows,
  editingAppNotes,
  setEditingAppNotes,
  uploadingAttachment,
  statusCounts,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  industryFilter,
  setIndustryFilter,
  locationFilter,
  setLocationFilter,
  deadlineFilter,
  setDeadlineFilter,
  searchQuery,
  setSearchQuery,
  uniqueIndustries,
  industryMap,
  uniqueLocations,
  locationMap,
  mobileFiltersOpen,
  setMobileFiltersOpen,
  activeFilterCount,
  trackerDisplayMode,
  setTrackerDisplayMode,
  onAdd,
  onDelete,
  onToggleRow,
  onStatusChange,
  onApplicationFieldChange,
  onAddContact,
  onOpenContact,
  onAttachmentUpload,
  onAttachmentDelete,
  onAppNotesChange,
  formatStageLabel,
  getStatusColor,
  formatStatus,
  getDeadlineStatus,
}: TrackerWorkspaceProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const statusOptions: ApplicationStatus[] = [
    "not_applied",
    "applied",
    "interview",
    "offer",
    "pending",
    "rejected",
    "successful",
  ];

  useEffect(() => {
    let ignore = false;

    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/contacts");
        if (!res.ok) {
          throw new Error("Failed to fetch contacts");
        }
        const data = await res.json();
        if (!ignore) {
          setContacts(data);
        }
      } catch (contactError) {
        console.error("Failed to load tracker contacts:", contactError);
      }
    };

    void fetchContacts();

    return () => {
      ignore = true;
    };
  }, []);

  const contactsByCompany = contacts.reduce<Record<string, Contact[]>>((result, contact) => {
    const key = contact.company?.trim().toLowerCase();
    if (!key) {
      return result;
    }
    result[key] = [...(result[key] || []), contact];
    return result;
  }, {});

  const cleanTextValue = (value: string) => value.trim() || null;

  const saveTextFieldOnBlur = (
    application: Application,
    field: "company" | "role" | "location" | "industry" | "website",
    value: string,
  ) => {
    const nextValue = field === "company" ? value.trim() : cleanTextValue(value);
    if (field === "company" && !nextValue) {
      return;
    }

    if (application[field] === nextValue) {
      return;
    }

    onApplicationFieldChange(application.id, { [field]: nextValue } as ApplicationUpdate);
  };

  const renderInlineApplicationFields = (app: Application) => (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Company
          </label>
          <input
            type="text"
            defaultValue={app.company}
            onBlur={(event) => saveTextFieldOnBlur(app, "company", event.currentTarget.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-white dark:focus:ring-white/10"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Role
          </label>
          <input
            type="text"
            defaultValue={app.role || ""}
            onBlur={(event) => saveTextFieldOnBlur(app, "role", event.currentTarget.value)}
            placeholder="e.g. Software Engineer"
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white dark:focus:ring-white/10"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Status
          </label>
          <div className="relative">
            <select
              value={app.status}
              onChange={(event) => onStatusChange(app.id, event.target.value as ApplicationStatus)}
              className="w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 pr-11 text-sm font-medium text-black outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-white dark:focus:ring-white/10"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
            <SelectArrow />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Company Type
          </label>
          <div className="relative">
            <select
              value={app.company_type || ""}
              onChange={(event) =>
                onApplicationFieldChange(app.id, {
                  company_type: (event.target.value as CompanyType | "") || null,
                })
              }
              className="w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 pr-11 text-sm text-black outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-white dark:focus:ring-white/10"
            >
              <option value="">Not set</option>
              <option value="established">Established</option>
              <option value="startup">Startup</option>
            </select>
            <SelectArrow />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Location
          </label>
          <input
            type="text"
            defaultValue={app.location || ""}
            onBlur={(event) => saveTextFieldOnBlur(app, "location", event.currentTarget.value)}
            placeholder="London, Remote"
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white dark:focus:ring-white/10"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Industry
          </label>
          <input
            type="text"
            defaultValue={app.industry || ""}
            onBlur={(event) => saveTextFieldOnBlur(app, "industry", event.currentTarget.value)}
            placeholder="Biotech, AI"
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white dark:focus:ring-white/10"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Deadline
          </label>
          <input
            type="date"
            value={app.deadline || ""}
            onChange={(event) =>
              onApplicationFieldChange(app.id, {
                deadline: event.target.value || null,
              })
            }
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-white dark:focus:ring-white/10"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Website
          </label>
          <input
            type="url"
            defaultValue={app.website || ""}
            onBlur={(event) => saveTextFieldOnBlur(app, "website", event.currentTarget.value)}
            placeholder="https://..."
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white dark:focus:ring-white/10"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
          Notes
        </h3>
        <textarea
          value={editingAppNotes[app.id] !== undefined ? editingAppNotes[app.id] : (app.notes || "")}
          onChange={(event) => onAppNotesChange(app.id, event.target.value)}
          onFocus={() => {
            if (editingAppNotes[app.id] === undefined) {
              setEditingAppNotes({ ...editingAppNotes, [app.id]: app.notes || "" });
            }
          }}
          placeholder="Add notes about this application..."
          className="min-h-[130px] w-full resize-y rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-black outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-white dark:focus:ring-white/10"
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-4 md:hidden">
        <div className="rounded-[28px] border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Current stage
              </div>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
                {formatStageLabel(statusFilter)}
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {filteredApplications.length} matches from {applications.length} saved applications.
              </p>
            </div>
            <button
              onClick={onAdd}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-500"
              aria-label="Add application"
            >
              <MdAdd className="text-2xl" />
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-3 p-4 text-left"
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-black dark:text-zinc-50">
                Filters
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {activeFilterCount > 0
                  ? `${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}`
                  : "Search, stage, type, location, and deadline"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {filteredApplications.length}
              </span>
              {mobileFiltersOpen ? (
                <MdExpandLess className="text-xl text-zinc-500 dark:text-zinc-400" />
              ) : (
                <MdExpandMore className="text-xl text-zinc-500 dark:text-zinc-400" />
              )}
            </div>
          </button>

          {mobileFiltersOpen ? (
            <div className="grid gap-4 border-t border-zinc-200 p-4 dark:border-zinc-800">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Company, role, location, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                    Stage
                  </label>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StageFilter)}
                      className="w-full appearance-none rounded-2xl border border-zinc-300 bg-white px-4 py-3 pr-11 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                    >
                      <option value="all">All</option>
                      <option value="not_applied">Not Applied</option>
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <SelectArrow />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                    Company type
                  </label>
                  <div className="relative">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as CompanyType | "all")}
                      className="w-full appearance-none rounded-2xl border border-zinc-300 bg-white px-4 py-3 pr-11 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                    >
                      <option value="all">All Types</option>
                      <option value="established">Established</option>
                      <option value="startup">Startup</option>
                    </select>
                    <SelectArrow />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                    Industry
                  </label>
                  <div className="relative">
                    <select
                      value={industryFilter}
                      onChange={(e) => setIndustryFilter(e.target.value)}
                      className="w-full appearance-none rounded-2xl border border-zinc-300 bg-white px-4 py-3 pr-11 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                    >
                      <option value="all">All Industries</option>
                      {uniqueIndustries.map((industryKey) => {
                        const displayName = industryMap.get(industryKey) || industryKey;
                        return (
                          <option key={industryKey} value={industryKey}>
                            {displayName}
                          </option>
                        );
                      })}
                    </select>
                    <SelectArrow />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                    Location
                  </label>
                  <div className="relative">
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full appearance-none rounded-2xl border border-zinc-300 bg-white px-4 py-3 pr-11 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                    >
                      <option value="all">All Locations</option>
                      {uniqueLocations.map((locationKey) => {
                        const displayName = locationMap.get(locationKey) || locationKey;
                        return (
                          <option key={locationKey} value={locationKey}>
                            {displayName}
                          </option>
                        );
                      })}
                    </select>
                    <SelectArrow />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                    Deadline
                  </label>
                  <div className="relative">
                    <select
                      value={deadlineFilter}
                      onChange={(e) => setDeadlineFilter(e.target.value)}
                      className="w-full appearance-none rounded-2xl border border-zinc-300 bg-white px-4 py-3 pr-11 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                    >
                      <option value="all">All Deadlines</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="this_week">This Week</option>
                      <option value="past">Past</option>
                    </select>
                    <SelectArrow />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {loading && applications.length === 0 ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-[28px] border border-zinc-200 bg-white p-6 text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            Loading applications...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            No applications found. {applications.length === 0 ? "Add your first application." : "Try adjusting your filters."}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const deadlineStatus = getDeadlineStatus(app.deadline);
              const isExpanded = expandedRows.has(app.id);
              const attachments: Attachment[] = app.attachments || [];
              const primaryRole = app.role?.split(",").map((role) => role.trim()).filter(Boolean)[0];
              const extraRoles = app.role?.split(",").map((role) => role.trim()).filter(Boolean).slice(1) || [];

              return (
                <div
                  key={app.id}
                  className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <button
                    type="button"
                    className="w-full p-4 text-left"
                    onClick={() => onToggleRow(app.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-lg font-semibold text-black dark:text-zinc-50">
                            {app.company}
                          </h3>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold text-white ${getStatusColor(app.status)}`}
                          >
                            {formatStatus(app.status)}
                          </span>
                        </div>
                        {primaryRole ? (
                          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                            {primaryRole}
                          </p>
                        ) : (
                          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            Role not added yet
                          </p>
                        )}
                      </div>
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-100 p-2 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                        {isExpanded ? <MdExpandLess className="text-xl" /> : <MdExpandMore className="text-xl" />}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                      {app.deadline ? (
                        <span
                          className={`rounded-full px-3 py-1 font-medium ${
                            deadlineStatus === "urgent"
                              ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                              : deadlineStatus === "past"
                                ? "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                          }`}
                        >
                          Deadline {new Date(app.deadline).toLocaleDateString()}
                        </span>
                      ) : null}
                      {app.company_type ? (
                        <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium capitalize text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {app.company_type}
                        </span>
                      ) : null}
                      {extraRoles.length > 0 ? (
                        <span className="rounded-full bg-violet-100 px-3 py-1 font-medium text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                          +{extraRoles.length} more role{extraRoles.length === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </div>
                  </button>

                  {isExpanded ? (
                    <div className="space-y-4 border-t border-zinc-200 bg-zinc-50 px-4 pb-4 pt-4 dark:border-zinc-800 dark:bg-zinc-950">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                            Status
                          </label>
                          <div className="relative">
                            <select
                              value={app.status}
                              onChange={(e) => onStatusChange(app.id, e.target.value as ApplicationStatus)}
                              className="w-full appearance-none rounded-2xl border border-zinc-300 bg-white px-3 py-2 pr-11 text-sm font-medium text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {formatStatus(status)}
                                </option>
                              ))}
                            </select>
                            <SelectArrow />
                          </div>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => onAddContact(app)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-blue-800 dark:hover:text-blue-300"
                          >
                            <MdPersonAdd className="text-lg" />
                            Add Contact
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {app.location ? (
                          <div>
                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                              Location
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {app.location.split(",").map((loc, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                >
                                  {loc.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        {app.industry ? (
                          <div>
                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                              Industry
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {app.industry.split(",").map((ind, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                >
                                  {ind.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {app.website ? (
                          <a
                            href={app.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-blue-800 dark:hover:text-blue-300"
                          >
                            <MdLaunch className="text-sm" />
                            Website
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => onDelete(app.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/60 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                          <MdDelete className="text-sm" />
                          Delete
                        </button>
                      </div>

                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                          Notes
                        </h3>
                        <textarea
                          value={editingAppNotes[app.id] !== undefined ? editingAppNotes[app.id] : (app.notes || "")}
                          onChange={(e) => onAppNotesChange(app.id, e.target.value)}
                          onFocus={() => {
                            if (editingAppNotes[app.id] === undefined) {
                              setEditingAppNotes({ ...editingAppNotes, [app.id]: app.notes || "" });
                            }
                          }}
                          placeholder="Add notes about this application..."
                          className="min-h-[110px] w-full rounded-2xl border border-zinc-300 bg-white p-3 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        />
                      </div>

                      <div>
                        <div className="mb-3 flex flex-col gap-2">
                          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            Attachments
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <label className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200">
                              <MdAttachFile />
                              Add Attachment
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) onAttachmentUpload(app.id, file, "other");
                                }}
                                disabled={uploadingAttachment === app.id}
                              />
                            </label>
                          </div>
                        </div>

                        {uploadingAttachment === app.id ? (
                          <div className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
                            Uploading...
                          </div>
                        ) : null}

                        {attachments.length === 0 ? (
                          <p className="text-sm italic text-zinc-500 dark:text-zinc-400">
                            No attachments yet
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {attachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                              >
                                <div className="min-w-0 flex-1">
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block truncate text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                                  >
                                    {attachment.name}
                                  </a>
                                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                    {attachment.type.replace("_", " ")} • {new Date(attachment.uploaded_at).toLocaleDateString()}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onAttachmentDelete(app.id, attachment.id)}
                                  className="rounded-full p-2 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                  title="Delete attachment"
                                >
                                  <MdDelete />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="hidden md:block">
        <div className="flex flex-col gap-3 rounded-3xl border border-cyan-100 bg-white/90 p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex min-w-0 gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { key: "not_applied", label: "Not Applied" },
              { key: "applied", label: "Applied" },
              { key: "interview", label: "Interview" },
              { key: "pending", label: "Pending" },
              { key: "offer", label: "Offer" },
              { key: "successful", label: "Successful" },
              { key: "rejected", label: "Rejected" },
              { key: "all", label: "All" },
            ].map((tab) => {
              const isActive = statusFilter === tab.key;
              const count = statusCounts[tab.key as keyof typeof statusCounts];
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key as StageFilter)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition ${getStageChipClasses(tab.key as StageFilter, isActive)}`}
                >
                  {tab.label}
                  <span
                    className={`min-w-[1.6rem] rounded-full px-2 py-0.5 text-center text-xs ${getStageCountClasses(tab.key as StageFilter, isActive)}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div>
            <input
              type="text"
              placeholder="Search company, role, location, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white dark:focus:ring-white/10"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col flex-wrap items-stretch gap-4 sm:flex-row sm:items-end">
          <div className="w-full flex-1 sm:min-w-[200px]">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              Company Type
            </label>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as CompanyType | "all")}
                className="w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 pr-11 text-sm text-black outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-white dark:focus:ring-white/10"
              >
                <option value="all">All Types</option>
                <option value="established">Established</option>
                <option value="startup">Startup</option>
              </select>
              <SelectArrow />
            </div>
          </div>
          <div className="w-full flex-1 sm:min-w-[200px]">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              Industry
            </label>
            <div className="relative">
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 pr-11 text-sm text-black outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-white dark:focus:ring-white/10"
              >
                <option value="all">All Industries</option>
                {uniqueIndustries.map((industryKey) => {
                  const displayName = industryMap.get(industryKey) || industryKey;
                  return (
                    <option key={industryKey} value={industryKey}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
              <SelectArrow />
            </div>
          </div>
          <div className="w-full flex-1 sm:min-w-[200px]">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              Location
            </label>
            <div className="relative">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 pr-11 text-sm text-black outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-white dark:focus:ring-white/10"
              >
                <option value="all">All Locations</option>
                {uniqueLocations.map((locationKey) => {
                  const displayName = locationMap.get(locationKey) || locationKey;
                  return (
                    <option key={locationKey} value={locationKey}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
              <SelectArrow />
            </div>
          </div>
          <div className="w-full flex-1 sm:min-w-[200px]">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              Deadline
            </label>
            <div className="relative">
              <select
                value={deadlineFilter}
                onChange={(e) => setDeadlineFilter(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 pr-11 text-sm text-black outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200/70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-white dark:focus:ring-white/10"
              >
                <option value="all">All Deadlines</option>
                <option value="upcoming">Upcoming</option>
                <option value="this_week">This Week</option>
                <option value="past">Past</option>
              </select>
              <SelectArrow />
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              View
            </label>
            <div className="flex rounded-full bg-zinc-100 p-1 dark:bg-zinc-800/80">
              <button
                type="button"
                onClick={() => setTrackerDisplayMode("rows")}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                  trackerDisplayMode === "rows"
                    ? "bg-white text-black shadow-sm dark:bg-white dark:text-zinc-950"
                    : "text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-zinc-50"
                }`}
              >
                <MdViewList className="text-lg" />
                Rows
              </button>
              <button
                type="button"
                onClick={() => setTrackerDisplayMode("grid")}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                  trackerDisplayMode === "grid"
                    ? "bg-white text-black shadow-sm dark:bg-white dark:text-zinc-950"
                    : "text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-zinc-50"
                }`}
              >
                <MdGridView className="text-lg" />
                Grid
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-[500px] mt-4">
          {loading && applications.length === 0 ? (
            <div className="flex min-h-[500px] items-center justify-center py-12 text-center text-zinc-600 dark:text-zinc-400">
              Loading applications...
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="flex min-h-[500px] items-center justify-center py-12 text-center text-zinc-600 dark:text-zinc-400">
              No applications found. {applications.length === 0 ? "Add your first application!" : "Try adjusting your filters."}
            </div>
          ) : trackerDisplayMode === "grid" ? (
            <div className="grid min-h-[500px] gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filteredApplications.map((app) => {
                const deadlineStatus = getDeadlineStatus(app.deadline);
                const isExpanded = expandedRows.has(app.id);
                const attachments: Attachment[] = app.attachments || [];
                const roles = app.role?.split(",").map((role) => role.trim()).filter(Boolean) || [];
                const locations = app.location?.split(",").map((location) => location.trim()).filter(Boolean) || [];

                return (
                  <div
                    key={app.id}
                    className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/90 dark:hover:border-cyan-700/60"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleRow(app.id)}
                      className="w-full p-5 text-left"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 gap-3">
                          <CompanyMark company={app.company} website={app.website} />
                          <div className="min-w-0">
                            <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                              {app.company_type || "Company"}
                            </div>
                            <h3 className="mt-2 truncate text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
                              {app.company}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                              {roles[0] || "Role not added yet"}
                            </p>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-white ${getStatusColor(app.status)}`}>
                          {formatStatus(app.status)}
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2 text-xs">
                        {app.deadline ? (
                          <span
                            className={`rounded-full px-3 py-1 font-medium ${
                              deadlineStatus === "urgent"
                                ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                                : deadlineStatus === "past"
                                  ? "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                            }`}
                          >
                            {new Date(app.deadline).toLocaleDateString()}
                          </span>
                        ) : null}
                        {locations.slice(0, 2).map((location) => (
                          <span
                            key={location}
                            className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                          >
                            {location}
                          </span>
                        ))}
                        {attachments.length > 0 ? (
                          <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            {attachments.length} attachment{attachments.length === 1 ? "" : "s"}
                          </span>
                        ) : null}
                      </div>
                    </button>

                    {isExpanded ? (
                      <div className="space-y-4 border-t border-cyan-100 bg-cyan-50/40 p-5 dark:border-zinc-800 dark:bg-zinc-950/60">
                        {renderInlineApplicationFields(app)}

                        <div className="flex flex-wrap gap-2">
                          {app.website ? (
                            <a
                              href={app.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-200 transition hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-700"
                            >
                              <MdLaunch className="text-sm" />
                              Website
                            </a>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => onAddContact(app)}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-200 transition hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-700"
                          >
                            <MdPersonAdd className="text-sm" />
                            Add Contact
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(app.id)}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-100 transition hover:bg-red-50 dark:bg-zinc-800 dark:text-red-300 dark:ring-red-900/60"
                          >
                            <MdDelete className="text-sm" />
                            Delete
                          </button>
                        </div>

                        <div className="rounded-2xl bg-white p-3 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                              Attachments
                            </h3>
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-black px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100">
                              <MdAttachFile className="text-sm" />
                              Add Attachment
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) onAttachmentUpload(app.id, file, "other");
                                }}
                                disabled={uploadingAttachment === app.id}
                              />
                            </label>
                          </div>
                          {attachments.length === 0 ? (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">No attachments yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900"
                                >
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="min-w-0 truncate text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-100"
                                  >
                                    {attachment.name}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => onAttachmentDelete(app.id, attachment.id)}
                                    className="rounded-full p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                                    title="Delete attachment"
                                  >
                                    <MdDelete />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="min-h-[500px] space-y-3">
              {filteredApplications.map((app) => {
                const deadlineStatus = getDeadlineStatus(app.deadline);
                const isExpanded = expandedRows.has(app.id);
                const attachments: Attachment[] = app.attachments || [];
                const linkedContacts = contactsByCompany[app.company.trim().toLowerCase()] || [];
                const roles = app.role?.split(",").map((role) => role.trim()).filter(Boolean) || [];
                const locations = app.location?.split(",").map((location) => location.trim()).filter(Boolean) || [];

                return (
                  <div
                    key={app.id}
                    className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:border-cyan-200 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/90 dark:hover:border-cyan-700/60"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleRow(app.id)}
                      className="grid w-full grid-cols-[1fr_auto] items-center gap-4 p-5 text-left lg:grid-cols-[minmax(260px,1.5fr)_minmax(180px,1fr)_minmax(160px,1fr)_auto]"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <CompanyMark company={app.company} website={app.website} />
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <h3 className="truncate text-base font-semibold text-black dark:text-zinc-50">
                              {app.company}
                            </h3>
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-white ${getStatusColor(app.status)}`}>
                              {formatStatus(app.status)}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
                            {roles.length > 0 ? roles.join(", ") : "Role not added yet"}
                          </p>
                        </div>
                      </div>

                      <div className="hidden min-w-0 lg:block">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                          Location
                        </div>
                        <div className="mt-1 truncate text-sm text-zinc-700 dark:text-zinc-300">
                          {locations.length > 0 ? locations.join(", ") : "-"}
                        </div>
                      </div>

                      <div className="hidden min-w-0 lg:block">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                          Deadline
                        </div>
                        <div
                          className={`mt-1 text-sm ${
                            deadlineStatus === "urgent"
                              ? "font-semibold text-red-600 dark:text-red-400"
                              : deadlineStatus === "past"
                                ? "text-zinc-400 line-through"
                                : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {app.deadline ? new Date(app.deadline).toLocaleDateString() : "-"}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        {app.website ? (
                          <a
                            href={app.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-white hover:text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-white/40 dark:hover:text-white sm:inline-flex"
                          >
                            <MdLaunch className="text-base" />
                            Website
                          </a>
                        ) : null}
                        <span className="inline-flex min-w-[7rem] items-center justify-center gap-2 rounded-full bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-600 transition dark:bg-zinc-700 dark:text-zinc-100">
                          <span className="inline-block w-12 text-center">{isExpanded ? "Close" : "Details"}</span>
                          {isExpanded ? <MdExpandLess className="text-lg" /> : <MdExpandMore className="text-lg" />}
                        </span>
                      </div>
                    </button>

                    {isExpanded ? (
                      <div className="border-t border-cyan-100 bg-cyan-50/40 p-5 dark:border-zinc-800 dark:bg-zinc-950/60">
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                          {renderInlineApplicationFields(app)}

                          <div className="space-y-4 rounded-3xl border border-emerald-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                            <div>
                              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                                Attach
                              </h3>
                              <div className="grid gap-2">
                                <button
                                  type="button"
                                  onClick={() => onAddContact(app)}
                                  className="flex w-full items-center gap-3 rounded-2xl bg-zinc-50 p-3 text-left transition hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-700"
                                >
                                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-zinc-700 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700">
                                    <MdPersonAdd className="text-lg" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                      Contact
                                    </span>
                                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                                      Recruiter or networking note
                                    </span>
                                  </span>
                                </button>
                                <label className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-zinc-50 p-3 text-left transition hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-700">
                                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-zinc-700 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700">
                                    <MdAttachFile className="text-lg" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                      File
                                    </span>
                                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                                      CV, cover letter, or notes
                                    </span>
                                  </span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) onAttachmentUpload(app.id, file, "other");
                                    }}
                                    disabled={uploadingAttachment === app.id}
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                                  Contacts
                                </h3>
                                {linkedContacts.length > 0 ? (
                                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                                    {linkedContacts.length}
                                  </span>
                                ) : null}
                              </div>

                              {linkedContacts.length === 0 ? (
                                <p className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-300">
                                  No contacts linked yet.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {linkedContacts.map((contact) => (
                                    <button
                                      type="button"
                                      key={contact.id}
                                      onClick={() => onOpenContact(contact.id)}
                                      className="w-full rounded-2xl bg-zinc-50 p-3 text-left ring-1 ring-inset ring-transparent transition hover:bg-white hover:ring-emerald-200 hover:shadow-sm dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:hover:ring-emerald-900/60"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                          <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                            {contact.name}
                                          </div>
                                          <div className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                                            {contact.email || contact.phone || contact.linkedin || "Open contact"}
                                          </div>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-white p-2 text-zinc-500 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">
                                          <MdLaunch className="text-sm" />
                                        </span>
                                      </div>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {contact.email ? (
                                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">
                                            <MdEmail className="text-sm" />
                                            Email
                                          </span>
                                        ) : null}
                                        {contact.phone ? (
                                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">
                                            <MdPhone className="text-sm" />
                                            Phone
                                          </span>
                                        ) : null}
                                        {contact.linkedin ? (
                                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">
                                            <MdLaunch className="text-sm" />
                                            LinkedIn
                                          </span>
                                        ) : null}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                                  Files
                                </h3>
                                {uploadingAttachment === app.id ? (
                                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    Uploading...
                                  </span>
                                ) : null}
                              </div>

                              {attachments.length === 0 ? (
                                <p className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-300">
                                  No files attached yet.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {attachments.map((attachment) => (
                                    <div
                                      key={attachment.id}
                                      className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-900"
                                    >
                                      <div className="min-w-0">
                                        <a
                                          href={attachment.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block truncate text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-100"
                                        >
                                          {attachment.name}
                                        </a>
                                        <div className="mt-1 text-xs capitalize text-zinc-500 dark:text-zinc-400">
                                          {attachment.type.replace("_", " ")} • {new Date(attachment.uploaded_at).toLocaleDateString()}
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => onAttachmentDelete(app.id, attachment.id)}
                                        className="rounded-full p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                                        title="Delete attachment"
                                      >
                                        <MdDelete />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onDelete(app.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/60 dark:bg-zinc-800 dark:text-red-300 dark:hover:bg-red-950/40"
                          >
                            <MdDelete className="text-base" />
                            Delete Application
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {filteredApplications.length > 0 ? (
          <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Showing {filteredApplications.length} of {applications.length} applications
          </div>
        ) : null}
      </div>
    </>
  );
}
