"use client";

import type { Application, ApplicationInsert, ApplicationStatus, CompanyType } from "@/types/application";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

interface ApplicationFormModalProps {
  show: boolean;
  loading: boolean;
  editingApplication: Application | null;
  formData: ApplicationInsert;
  setFormData: Dispatch<SetStateAction<ApplicationInsert>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

function SelectArrow() {
  return (
    <MdKeyboardArrowDown
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400 dark:text-zinc-500"
    />
  );
}

export function ApplicationFormModal({
  show,
  loading,
  editingApplication,
  formData,
  setFormData,
  onSubmit,
  onClose,
}: ApplicationFormModalProps) {
  if (!show) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-none flex-col overflow-hidden bg-white dark:bg-zinc-900 sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900 sm:hidden">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Back
          </button>
          <div className="text-sm font-semibold text-black dark:text-zinc-50">
            {editingApplication ? "Edit Application" : "Add Application"}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-2 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <h2 className="mb-4 hidden text-2xl font-semibold text-black dark:text-zinc-50 sm:block">
            {editingApplication ? "Edit Application" : "Add New Application"}
          </h2>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full rounded-md border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Role
                </label>
                <input
                  type="text"
                  value={formData.role || ""}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value || null })}
                  className="w-full rounded-md border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  placeholder="e.g. Software Engineer, Data Scientist (comma-separated)"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Separate multiple roles with commas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Company Type
                </label>
                <div className="relative">
                  <select
                    value={formData.company_type || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company_type: (e.target.value as CompanyType | "") || null,
                      })
                    }
                    className="w-full appearance-none rounded-md border border-zinc-300 bg-white px-3 py-2 pr-10 text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  >
                    <option value="">Select type</option>
                    <option value="established">Established</option>
                    <option value="startup">Startup</option>
                  </select>
                  <SelectArrow />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as ApplicationStatus,
                      })
                    }
                    className="w-full appearance-none rounded-md border border-zinc-300 bg-white px-3 py-2 pr-10 text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  >
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
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value || null })}
                  className="w-full rounded-md border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  placeholder="e.g. New York, Remote (comma-separated)"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Separate multiple locations with commas
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Industry
                </label>
                <input
                  type="text"
                  value={formData.industry || ""}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value || null })}
                  placeholder="e.g. Biotech, Pharma, Healthcare (comma-separated)"
                  className="w-full rounded-md border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Separate multiple industries with commas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline || ""}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value || null })}
                  className="w-full rounded-md border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value || null })}
                  placeholder="https://..."
                  className="w-full rounded-md border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Notes
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                rows={4}
                className="w-full rounded-md border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-zinc-200 bg-white pt-4 dark:border-zinc-800 dark:bg-zinc-900 sm:static sm:border-t-0 sm:bg-transparent">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-500 disabled:bg-zinc-400"
              >
                {loading ? "Saving..." : editingApplication ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-zinc-200 px-4 py-2 text-black transition hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
