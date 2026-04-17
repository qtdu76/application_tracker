"use client";

import { MdApps, MdExpandLess, MdExpandMore, MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import type { MobileMenuItem, MobileMenuItemId } from "../tracker-types";

interface MobileNavigationProps {
  showMobileMenu: boolean;
  mobileHeaderTitle: string;
  mobileHeaderSubtitle: string;
  mobileMenuReorderMode: boolean;
  mobileMenuItems: MobileMenuItem[];
  onShowMenu: () => void;
  onToggleReorderMode: () => void;
  onOpenItem: (itemId: MobileMenuItemId) => void;
  onMoveItem: (itemId: MobileMenuItemId, direction: -1 | 1) => void;
}

export function MobileNavigation({
  showMobileMenu,
  mobileHeaderTitle,
  mobileHeaderSubtitle,
  mobileMenuReorderMode,
  mobileMenuItems,
  onShowMenu,
  onToggleReorderMode,
  onOpenItem,
  onMoveItem,
}: MobileNavigationProps) {
  return (
    <>
      <div className="sticky top-20 z-20 -mx-1 md:hidden">
        <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            onClick={onShowMenu}
            className="flex w-full items-center justify-between gap-3 p-4 text-left"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-3 dark:border-cyan-900/60 dark:bg-cyan-950/40">
                {showMobileMenu ? (
                  <MdApps className="text-2xl text-cyan-600 dark:text-cyan-400" />
                ) : (
                  <MdKeyboardArrowDown className="rotate-90 text-2xl text-cyan-600 dark:text-cyan-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold tracking-tight text-black dark:text-zinc-50">
                  {mobileHeaderTitle}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {mobileHeaderSubtitle}
                </p>
              </div>
            </div>
            {showMobileMenu ? (
              <MdExpandLess className="text-xl text-zinc-500 dark:text-zinc-400" />
            ) : (
              <MdExpandMore className="text-xl text-zinc-500 dark:text-zinc-400" />
            )}
          </button>
        </div>
      </div>

      {showMobileMenu ? (
        <div className="space-y-4 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Arrange the sections you use most near the top.
            </p>
            <button
              type="button"
              onClick={onToggleReorderMode}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                mobileMenuReorderMode
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {mobileMenuReorderMode ? "Done" : "Reorder"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {mobileMenuItems.map((item, index) => (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent}`} />
                <button
                  type="button"
                  disabled={mobileMenuReorderMode}
                  onClick={() => onOpenItem(item.id)}
                  className="flex h-full min-h-[176px] w-full flex-col p-4 text-left disabled:cursor-default"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className={`rounded-2xl border p-3 ${item.iconShell}`}>
                      {item.icon}
                    </div>
                    {item.count !== null ? (
                      <span className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {item.count}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-auto">
                    <p className="text-base font-semibold tracking-tight text-black dark:text-zinc-50">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                </button>
                {mobileMenuReorderMode ? (
                  <div className="flex items-center justify-end gap-1 border-t border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
                    <button
                      type="button"
                      onClick={() => onMoveItem(item.id, -1)}
                      disabled={index === 0}
                      className="rounded-full p-2 text-zinc-600 transition hover:bg-white disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      <MdKeyboardArrowUp className="text-xl" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveItem(item.id, 1)}
                      disabled={index === mobileMenuItems.length - 1}
                      className="rounded-full p-2 text-zinc-600 transition hover:bg-white disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      <MdKeyboardArrowDown className="text-xl" />
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
