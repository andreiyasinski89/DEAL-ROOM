import { T } from "../i18n";

/** Channel names (Russian keys; render with tr()). */
export const CHANNEL_LABEL: Record<string, string> = {
  call: T("звонок"),
  meeting: T("встреча"),
  chat: T("переписка"),
  zoom: T("Zoom"),
};

/** Kept for places that have no i18n context (history rows etc.). */
export const CHANNEL_RU = CHANNEL_LABEL;
