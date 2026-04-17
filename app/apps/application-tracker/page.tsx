"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Application, ApplicationInsert, ApplicationStatus, ApplicationUpdate, CompanyType } from "@/types/application";
import {
  MdApps,
  MdArticle,
  MdChecklist,
  MdGroups,
  MdMenuBook,
  MdNotes,
  MdPendingActions,
  MdRadioButtonUnchecked,
  MdSouth,
  MdTaskAlt,
  MdTravelExplore,
} from "react-icons/md";
import ProtectedPage from "@/components/ProtectedPage";
import { ApplicationFormModal } from "./components/application-form-modal";
import { ContactsView } from "./components/contacts-view";
import { DocumentationView } from "./components/documentation-view";
import { MobileNavigation } from "./components/mobile-navigation";
import { NotesView } from "./components/notes-view";
import { TrackerWorkspace } from "./components/tracker-workspace";
import {
  MOBILE_MENU_DEFAULT_ORDER,
  MOBILE_MENU_ORDER_KEY,
  type MobileMenuItem,
  type MobileMenuItemId,
  type StageFilter,
  type TrackerDisplayMode,
  type ViewMode,
} from "./types";

function normalizeMobileMenuOrder(order: string[]): MobileMenuItemId[] {
  const validIds = new Set(MOBILE_MENU_DEFAULT_ORDER);
  const sanitized = order.filter(
    (id): id is MobileMenuItemId => validIds.has(id as MobileMenuItemId),
  );
  const seen = new Set<MobileMenuItemId>();
  const deduped = sanitized.filter((id) => {
    if (seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });

  for (const fallbackId of MOBILE_MENU_DEFAULT_ORDER) {
    if (!seen.has(fallbackId)) {
      deduped.push(fallbackId);
    }
  }

  return deduped;
}

function moveItem<T>(items: T[], fromIndex: number, direction: -1 | 1): T[] {
  const toIndex = fromIndex + direction;
  if (toIndex < 0 || toIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const item = next[fromIndex];
  if (item === undefined) {
    return items;
  }

  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function formatStageLabel(stage: StageFilter): string {
  if (stage === "all") {
    return "All Applications";
  }
  return stage
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getViewLabel(viewMode: ViewMode): string {
  switch (viewMode) {
    case "tracker":
      return "Tracker";
    case "notes":
      return "Notes";
    case "contacts":
      return "Contacts";
    case "docs":
      return "Documentation";
  }
}

function ApplicationTrackerContent() {
  const [viewMode, setViewMode] = useState<ViewMode>("tracker");
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  const [mobileMenuOrder, setMobileMenuOrder] = useState<MobileMenuItemId[]>(
    MOBILE_MENU_DEFAULT_ORDER,
  );
  const [mobileMenuReorderMode, setMobileMenuReorderMode] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [uploadingAttachment, setUploadingAttachment] = useState<string | null>(null);
  const [editingAppNotes, setEditingAppNotes] = useState<{ [key: string]: string }>({});
  const [trackerDisplayMode, setTrackerDisplayMode] = useState<TrackerDisplayMode>("rows");
  const [contactInitialCompany, setContactInitialCompany] = useState<string | null>(null);
  const [contactInitialContactId, setContactInitialContactId] = useState<string | null>(null);
  const appNotesTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const [statusFilter, setStatusFilter] = useState<StageFilter>("not_applied");
  const [typeFilter, setTypeFilter] = useState<CompanyType | "all">("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [deadlineFilter, setDeadlineFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [formData, setFormData] = useState<ApplicationInsert>({
    company: "",
    role: null,
    company_type: null,
    location: null,
    industry: null,
    status: "not_applied",
    deadline: null,
    website: null,
    notes: null,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedOrder = window.localStorage.getItem(MOBILE_MENU_ORDER_KEY);
    if (!storedOrder) {
      return;
    }

    try {
      const parsed = JSON.parse(storedOrder);
      if (Array.isArray(parsed)) {
        setMobileMenuOrder(normalizeMobileMenuOrder(parsed));
      }
    } catch (storageError) {
      console.error("Failed to parse mobile tracker menu order:", storageError);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(MOBILE_MENU_ORDER_KEY, JSON.stringify(mobileMenuOrder));
  }, [mobileMenuOrder]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/applications");
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data = await res.json();
      setApplications(data);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchApplications();
  }, []);

  const allIndustries = applications
    .map((application) => application.industry)
    .filter(Boolean)
    .flatMap((industry) => industry!.split(",").map((value) => value.trim()).filter(Boolean));
  const industryMap = new Map<string, string>();
  allIndustries.forEach((industry) => {
    const lower = industry.toLowerCase();
    if (!industryMap.has(lower)) {
      industryMap.set(lower, industry);
    }
  });
  const uniqueIndustries = Array.from(industryMap.keys()).sort();

  const allLocations = applications
    .map((application) => application.location)
    .filter(Boolean)
    .flatMap((location) => location!.split(",").map((value) => value.trim()).filter(Boolean));
  const locationMap = new Map<string, string>();
  allLocations.forEach((location) => {
    const lower = location.toLowerCase();
    if (!locationMap.has(lower)) {
      locationMap.set(lower, location);
    }
  });
  const uniqueLocations = Array.from(locationMap.keys()).sort();

  const statusCounts = useMemo(
    () => ({
      not_applied: applications.filter((application) => application.status === "not_applied").length,
      applied: applications.filter((application) => application.status === "applied").length,
      interview: applications.filter((application) => application.status === "interview").length,
      offer: applications.filter((application) => application.status === "offer").length,
      successful: applications.filter((application) => application.status === "successful").length,
      pending: applications.filter((application) => application.status === "pending").length,
      rejected: applications.filter((application) => application.status === "rejected").length,
      all: applications.length,
    }),
    [applications],
  );

  const filteredApplications = applications.filter((application) => {
    if (statusFilter !== "all" && application.status !== statusFilter) return false;
    if (typeFilter !== "all" && application.company_type !== typeFilter) return false;

    if (industryFilter !== "all" && application.industry) {
      const applicationIndustries = application.industry
        .split(",")
        .map((industry) => industry.trim().toLowerCase())
        .filter(Boolean);
      if (!applicationIndustries.includes(industryFilter.toLowerCase())) return false;
    } else if (industryFilter !== "all" && !application.industry) {
      return false;
    }

    if (locationFilter !== "all" && application.location) {
      const applicationLocations = application.location
        .split(",")
        .map((location) => location.trim().toLowerCase())
        .filter(Boolean);
      if (!applicationLocations.includes(locationFilter.toLowerCase())) return false;
    } else if (locationFilter !== "all" && !application.location) {
      return false;
    }

    if (deadlineFilter !== "all") {
      if (!application.deadline) return false;
      const deadline = new Date(application.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (deadlineFilter === "upcoming") {
        return deadline >= today;
      }
      if (deadlineFilter === "past") {
        return deadline < today;
      }
      if (deadlineFilter === "this_week") {
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return deadline >= today && deadline <= weekFromNow;
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesCompany = application.company.toLowerCase().includes(query);
      const matchesLocation = application.location
        ? application.location.split(",").some((location) => location.trim().toLowerCase().includes(query))
        : false;
      const matchesIndustry = application.industry
        ? application.industry.split(",").some((industry) => industry.trim().toLowerCase().includes(query))
        : false;
      const matchesRole = application.role
        ? application.role.split(",").some((role) => role.trim().toLowerCase().includes(query))
        : false;
      const matchesNotes = application.notes?.toLowerCase().includes(query) || false;

      if (!matchesCompany && !matchesLocation && !matchesIndustry && !matchesRole && !matchesNotes) {
        return false;
      }
    }

    return true;
  });

  const activeFilterCount = [
    typeFilter !== "all",
    industryFilter !== "all",
    locationFilter !== "all",
    deadlineFilter !== "all",
    searchQuery.trim().length > 0,
  ].filter(Boolean).length;

  const openMobileDestination = (destination: MobileMenuItemId) => {
    if (destination === "notes" || destination === "contacts" || destination === "docs") {
      setViewMode(destination);
    } else if (destination === "tracker") {
      setViewMode("tracker");
      setStatusFilter("all");
    } else {
      setViewMode("tracker");
      setStatusFilter(destination);
    }

    setShowMobileMenu(false);
  };

  const moveMobileMenuItem = (itemId: MobileMenuItemId, direction: -1 | 1) => {
    setMobileMenuOrder((currentOrder) => {
      const index = currentOrder.indexOf(itemId);
      if (index === -1) {
        return currentOrder;
      }
      return moveItem(currentOrder, index, direction);
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      if (editingApplication) {
        const res = await fetch(`/api/applications/${editingApplication.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to update application");
      } else {
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to create application");
      }

      resetApplicationFormState();
      setFormData({
        company: "",
        role: null,
        company_type: null,
        location: null,
        industry: null,
        status: "not_applied",
        deadline: null,
        website: null,
        notes: null,
      });
      await fetchApplications();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete application");
      await fetchApplications();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete application");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, status: ApplicationStatus) => {
    void handleApplicationFieldChange(applicationId, { status });
  };

  const handleApplicationFieldChange = async (applicationId: string, patch: ApplicationUpdate) => {
    const previousApplications = applications;
    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === applicationId ? { ...application, ...patch } : application,
      ),
    );

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update application");
      const updatedApplication = await res.json();
      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === applicationId ? updatedApplication : application,
        ),
      );
    } catch (updateError) {
      setApplications(previousApplications);
      setError(updateError instanceof Error ? updateError.message : "Failed to update application");
    }
  };

  const handleAddContactForApplication = (application: Application) => {
    setContactInitialCompany(application.company);
    setContactInitialContactId(null);
    setViewMode("contacts");
    setShowMobileMenu(false);
  };

  const handleOpenContact = (contactId: string) => {
    setContactInitialCompany(null);
    setContactInitialContactId(contactId);
    setViewMode("contacts");
    setShowMobileMenu(false);
  };

  const handleAdd = () => {
    setEditingApplication(null);
    setFormData({
      company: "",
      role: null,
      company_type: null,
      location: null,
      industry: null,
      status: "not_applied",
      deadline: null,
      website: null,
      notes: null,
    });
    setShowModal(true);
  };

  const getStatusColor = (status: ApplicationStatus) => {
    const colors: Record<ApplicationStatus, string> = {
      not_applied: "bg-gray-500",
      applied: "bg-blue-500",
      interview: "bg-yellow-500",
      offer: "bg-green-500",
      successful: "bg-emerald-600",
      rejected: "bg-red-500",
      pending: "bg-orange-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const formatStatus = (status: ApplicationStatus) =>
    status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const getDeadlineStatus = (deadline: string | null) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    if (deadlineDate < today) return "past";
    const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7) return "urgent";
    return "upcoming";
  };

  const toggleRow = (applicationId: string) => {
    const nextExpandedRows = new Set(expandedRows);
    if (nextExpandedRows.has(applicationId)) {
      nextExpandedRows.delete(applicationId);
    } else {
      nextExpandedRows.add(applicationId);
    }
    setExpandedRows(nextExpandedRows);
  };

  const handleAttachmentUpload = async (
    applicationId: string,
    file: File,
    type: "cv" | "cover_letter" | "other",
  ) => {
    try {
      setUploadingAttachment(applicationId);
      const payload = new FormData();
      payload.append("file", file);
      payload.append("type", type);

      const res = await fetch(`/api/applications/${applicationId}/attachments`, {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload attachment");
      }

      await fetchApplications();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload attachment");
    } finally {
      setUploadingAttachment(null);
    }
  };

  const handleAttachmentDelete = async (applicationId: string, attachmentId: string) => {
    if (!confirm("Are you sure you want to delete this attachment?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/applications/${applicationId}/attachments?attachmentId=${attachmentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete attachment");
      }

      await fetchApplications();
    } catch (attachmentError) {
      setError(attachmentError instanceof Error ? attachmentError.message : "Failed to delete attachment");
    } finally {
      setLoading(false);
    }
  };

  const handleAppNotesChange = (applicationId: string, notes: string) => {
    setEditingAppNotes({ ...editingAppNotes, [applicationId]: notes });

    if (appNotesTimeoutRef.current[applicationId]) {
      clearTimeout(appNotesTimeoutRef.current[applicationId]);
    }

    appNotesTimeoutRef.current[applicationId] = setTimeout(async () => {
      try {
        const application = applications.find((currentApplication) => currentApplication.id === applicationId);
        if (!application) return;

        const res = await fetch(`/api/applications/${applicationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: application.company,
            role: application.role,
            company_type: application.company_type,
            location: application.location,
            industry: application.industry,
            status: application.status,
            deadline: application.deadline,
            website: application.website,
            notes: notes.trim() || null,
          }),
        });
        if (!res.ok) throw new Error("Failed to update notes");
        await fetchApplications();
      } catch (notesError) {
        console.error("Failed to update notes:", notesError);
        await fetchApplications();
      }
    }, 1000);
  };

  const resetApplicationFormState = () => {
    setShowModal(false);
    setEditingApplication(null);
  };

  const mobileMenuItems: MobileMenuItem[] = useMemo(
    () =>
      mobileMenuOrder.map((itemId): MobileMenuItem => {
        switch (itemId) {
          case "tracker":
            return {
              id: itemId,
              label: "Tracker",
              description: "Browse and manage applications",
              count: null,
              icon: <MdApps className="text-2xl text-cyan-600 dark:text-cyan-400" />,
              iconShell: "border-cyan-200 bg-cyan-50 dark:border-cyan-900/60 dark:bg-cyan-950/40",
              accent: "from-cyan-400/90 to-sky-600/90",
            };
          case "notes":
            return {
              id: itemId,
              label: "Notes",
              description: "Keep freeform job-search notes",
              count: null,
              icon: <MdNotes className="text-2xl text-violet-600 dark:text-violet-400" />,
              iconShell: "border-violet-200 bg-violet-50 dark:border-violet-900/60 dark:bg-violet-950/40",
              accent: "from-violet-400/90 to-violet-600/90",
            };
          case "contacts":
            return {
              id: itemId,
              label: "Contacts",
              description: "Recruiters and networking contacts",
              count: null,
              icon: <MdGroups className="text-2xl text-amber-600 dark:text-amber-400" />,
              iconShell: "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40",
              accent: "from-amber-400/90 to-orange-600/90",
            };
          case "docs":
            return {
              id: itemId,
              label: "Documentation",
              description: "Stage meanings and workflow guide",
              count: null,
              icon: <MdMenuBook className="text-2xl text-slate-600 dark:text-slate-300" />,
              iconShell: "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40",
              accent: "from-slate-400/90 to-slate-600/90",
            };
          case "not_applied":
            return {
              id: itemId,
              label: "Not Applied",
              description: "Opportunities to review next",
              count: statusCounts.not_applied,
              icon: <MdRadioButtonUnchecked className="text-2xl text-zinc-600 dark:text-zinc-300" />,
              iconShell: "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40",
              accent: "from-zinc-400/90 to-zinc-600/90",
            };
          case "applied":
            return {
              id: itemId,
              label: "Applied",
              description: "Recently submitted applications",
              count: statusCounts.applied,
              icon: <MdTaskAlt className="text-2xl text-blue-600 dark:text-blue-400" />,
              iconShell: "border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/40",
              accent: "from-blue-400/90 to-blue-600/90",
            };
          case "interview":
            return {
              id: itemId,
              label: "Interview",
              description: "Active interview processes",
              count: statusCounts.interview,
              icon: <MdTravelExplore className="text-2xl text-yellow-600 dark:text-yellow-400" />,
              iconShell: "border-yellow-200 bg-yellow-50 dark:border-yellow-900/60 dark:bg-yellow-950/40",
              accent: "from-yellow-400/90 to-yellow-600/90",
            };
          case "offer":
            return {
              id: itemId,
              label: "Offer",
              description: "Offers to compare and track",
              count: statusCounts.offer,
              icon: <MdChecklist className="text-2xl text-green-600 dark:text-green-400" />,
              iconShell: "border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-950/40",
              accent: "from-green-400/90 to-emerald-600/90",
            };
          case "pending":
            return {
              id: itemId,
              label: "Pending",
              description: "Waiting on next steps",
              count: statusCounts.pending,
              icon: <MdPendingActions className="text-2xl text-orange-600 dark:text-orange-400" />,
              iconShell: "border-orange-200 bg-orange-50 dark:border-orange-900/60 dark:bg-orange-950/40",
              accent: "from-orange-400/90 to-orange-600/90",
            };
          case "rejected":
            return {
              id: itemId,
              label: "Rejected",
              description: "Closed applications for reference",
              count: statusCounts.rejected,
              icon: <MdSouth className="text-2xl text-red-600 dark:text-red-400" />,
              iconShell: "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40",
              accent: "from-red-400/90 to-red-600/90",
            };
          case "all":
            return {
              id: itemId,
              label: "All",
              description: "Everything in one view",
              count: statusCounts.all,
              icon: <MdArticle className="text-2xl text-indigo-600 dark:text-indigo-400" />,
              iconShell: "border-indigo-200 bg-indigo-50 dark:border-indigo-900/60 dark:bg-indigo-950/40",
              accent: "from-indigo-400/90 to-indigo-600/90",
            };
        }
      }),
    [mobileMenuOrder, statusCounts],
  );

  const mobileHeaderTitle = showMobileMenu
    ? "Application Tracker"
    : viewMode === "tracker"
      ? formatStageLabel(statusFilter)
      : getViewLabel(viewMode);

  const mobileHeaderSubtitle = showMobileMenu
    ? "Open a section"
    : viewMode === "tracker"
      ? `${filteredApplications.length} matching applications`
      : "Back to menu";

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[linear-gradient(135deg,#f4f4f5_0%,#eff6ff_45%,#f0fdf4_100%)] px-6 pb-20 pt-20 dark:bg-[linear-gradient(135deg,#09090b_0%,#101010_48%,#102018_100%)]">
      <div className="w-full max-w-7xl min-h-[800px] space-y-6 rounded-[28px] border border-cyan-100/80 bg-white/95 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:border-zinc-800 dark:bg-zinc-950/90 md:p-8">
        <MobileNavigation
          showMobileMenu={showMobileMenu}
          mobileHeaderTitle={mobileHeaderTitle}
          mobileHeaderSubtitle={mobileHeaderSubtitle}
          mobileMenuReorderMode={mobileMenuReorderMode}
          mobileMenuItems={mobileMenuItems}
          onShowMenu={() => {
            if (!showMobileMenu) {
              setShowMobileMenu(true);
              setMobileMenuReorderMode(false);
            }
          }}
          onToggleReorderMode={() => setMobileMenuReorderMode((currentValue) => !currentValue)}
          onOpenItem={openMobileDestination}
          onMoveItem={moveMobileMenuItem}
        />

        <div className="hidden items-center justify-between gap-4 md:flex md:flex-wrap">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="flex rounded-full bg-white p-1 shadow-sm ring-1 ring-inset ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              {[
                { key: "tracker", label: "Tracker", active: "bg-cyan-600 text-white shadow-sm dark:bg-cyan-300 dark:text-zinc-950" },
                { key: "notes", label: "Notes", active: "bg-lime-600 text-white shadow-sm dark:bg-lime-300 dark:text-zinc-950" },
                { key: "contacts", label: "Contacts", active: "bg-amber-500 text-zinc-950 shadow-sm dark:bg-amber-300 dark:text-zinc-950" },
                { key: "docs", label: "Docs", active: "bg-indigo-600 text-white shadow-sm dark:bg-indigo-300 dark:text-zinc-950" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setViewMode(item.key as ViewMode)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    viewMode === item.key
                      ? item.active
                      : "text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-zinc-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleAdd}
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 dark:bg-emerald-300 dark:text-zinc-950 dark:hover:bg-emerald-200"
            >
              Add Application
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded border border-red-300 bg-red-100 p-3 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        ) : null}

        <div className="md:hidden">
          {!showMobileMenu ? (
            viewMode === "tracker" ? (
              <TrackerWorkspace
                loading={loading}
                applications={applications}
                filteredApplications={filteredApplications}
                expandedRows={expandedRows}
                editingAppNotes={editingAppNotes}
                setEditingAppNotes={setEditingAppNotes}
                uploadingAttachment={uploadingAttachment}
                statusCounts={statusCounts}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                industryFilter={industryFilter}
                setIndustryFilter={setIndustryFilter}
                locationFilter={locationFilter}
                setLocationFilter={setLocationFilter}
                deadlineFilter={deadlineFilter}
                setDeadlineFilter={setDeadlineFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                uniqueIndustries={uniqueIndustries}
                industryMap={industryMap}
                uniqueLocations={uniqueLocations}
                locationMap={locationMap}
                mobileFiltersOpen={mobileFiltersOpen}
                setMobileFiltersOpen={setMobileFiltersOpen}
                activeFilterCount={activeFilterCount}
                trackerDisplayMode={trackerDisplayMode}
                setTrackerDisplayMode={setTrackerDisplayMode}
                onAdd={handleAdd}
                onDelete={(applicationId) => void handleDelete(applicationId)}
                onToggleRow={toggleRow}
                onStatusChange={(applicationId, status) => void handleStatusChange(applicationId, status)}
                onApplicationFieldChange={(applicationId, patch) => void handleApplicationFieldChange(applicationId, patch)}
                onAddContact={handleAddContactForApplication}
                onOpenContact={handleOpenContact}
                onAttachmentUpload={handleAttachmentUpload}
                onAttachmentDelete={(applicationId, attachmentId) => void handleAttachmentDelete(applicationId, attachmentId)}
                onAppNotesChange={handleAppNotesChange}
                formatStageLabel={formatStageLabel}
                getStatusColor={getStatusColor}
                formatStatus={formatStatus}
                getDeadlineStatus={getDeadlineStatus}
              />
            ) : viewMode === "notes" ? (
              <NotesView />
            ) : viewMode === "contacts" ? (
              <ContactsView
                applications={applications}
                initialCompany={contactInitialCompany}
                onInitialCompanyConsumed={() => setContactInitialCompany(null)}
                initialContactId={contactInitialContactId}
                onInitialContactConsumed={() => setContactInitialContactId(null)}
              />
            ) : (
              <DocumentationView />
            )
          ) : null}
        </div>

        <div className="hidden md:block">
          {viewMode === "tracker" ? (
            <TrackerWorkspace
              loading={loading}
              applications={applications}
              filteredApplications={filteredApplications}
              expandedRows={expandedRows}
              editingAppNotes={editingAppNotes}
              setEditingAppNotes={setEditingAppNotes}
              uploadingAttachment={uploadingAttachment}
              statusCounts={statusCounts}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              industryFilter={industryFilter}
              setIndustryFilter={setIndustryFilter}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              deadlineFilter={deadlineFilter}
              setDeadlineFilter={setDeadlineFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              uniqueIndustries={uniqueIndustries}
              industryMap={industryMap}
              uniqueLocations={uniqueLocations}
              locationMap={locationMap}
              mobileFiltersOpen={mobileFiltersOpen}
              setMobileFiltersOpen={setMobileFiltersOpen}
              activeFilterCount={activeFilterCount}
              trackerDisplayMode={trackerDisplayMode}
              setTrackerDisplayMode={setTrackerDisplayMode}
              onAdd={handleAdd}
              onDelete={(applicationId) => void handleDelete(applicationId)}
              onToggleRow={toggleRow}
              onStatusChange={(applicationId, status) => void handleStatusChange(applicationId, status)}
              onApplicationFieldChange={(applicationId, patch) => void handleApplicationFieldChange(applicationId, patch)}
              onAddContact={handleAddContactForApplication}
              onOpenContact={handleOpenContact}
              onAttachmentUpload={handleAttachmentUpload}
              onAttachmentDelete={(applicationId, attachmentId) => void handleAttachmentDelete(applicationId, attachmentId)}
              onAppNotesChange={handleAppNotesChange}
              formatStageLabel={formatStageLabel}
              getStatusColor={getStatusColor}
              formatStatus={formatStatus}
              getDeadlineStatus={getDeadlineStatus}
            />
          ) : viewMode === "notes" ? (
            <NotesView />
          ) : viewMode === "contacts" ? (
            <ContactsView
              applications={applications}
              initialCompany={contactInitialCompany}
              onInitialCompanyConsumed={() => setContactInitialCompany(null)}
              initialContactId={contactInitialContactId}
              onInitialContactConsumed={() => setContactInitialContactId(null)}
            />
          ) : (
            <DocumentationView />
          )}
        </div>

        <ApplicationFormModal
          show={showModal}
          loading={loading}
          editingApplication={editingApplication}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={resetApplicationFormState}
        />
      </div>
    </div>
  );
}

export default function ApplicationTracker() {
  return (
    <ProtectedPage>
      <ApplicationTrackerContent />
    </ProtectedPage>
  );
}
