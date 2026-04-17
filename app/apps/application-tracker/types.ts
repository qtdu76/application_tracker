import type { ApplicationStatus } from "@/types/application";
import type { ReactElement } from "react";

export type ViewMode = "tracker" | "notes" | "contacts" | "docs";
export type StageFilter = ApplicationStatus | "all";
export type TrackerDisplayMode = "rows" | "grid";
export type MobileMenuStage =
  | "not_applied"
  | "applied"
  | "interview"
  | "offer"
  | "pending"
  | "rejected"
  | "all";
export type MobileMenuItemId = ViewMode | MobileMenuStage;

export interface MobileMenuItem {
  id: MobileMenuItemId;
  label: string;
  description: string;
  count: number | null;
  icon: ReactElement;
  iconShell: string;
  accent: string;
}

export const MOBILE_MENU_ORDER_KEY = "application-tracker-mobile-menu-order-v1";

export const MOBILE_MENU_DEFAULT_ORDER: MobileMenuItemId[] = [
  "tracker",
  "notes",
  "contacts",
  "not_applied",
  "applied",
  "interview",
  "offer",
  "pending",
  "rejected",
  "all",
  "docs",
];
