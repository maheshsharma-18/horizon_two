import type { Priority } from "./types";

export interface ParsedSearchQuery {
  freeText: string;
  from?: string;
  after?: Date;
  before?: Date;
  isPriority?: Priority;
  /** True if the raw query contained `has:attachment` — surfaced so the UI can say "not supported yet" instead of silently ignoring it. */
  hasAttachmentRequested: boolean;
}

const TOKEN_RE = /(from|after|before|is):(\S+)/gi;

export function parseSearchQuery(raw: string): ParsedSearchQuery {
  let from: string | undefined;
  let after: Date | undefined;
  let before: Date | undefined;
  let isPriority: Priority | undefined;
  let hasAttachmentRequested = false;

  const freeText = raw
    .replace(/has:attachment/gi, () => {
      hasAttachmentRequested = true;
      return "";
    })
    .replace(TOKEN_RE, (_match, key: string, value: string) => {
      const k = key.toLowerCase();
      if (k === "from") from = value.toLowerCase();
      if (k === "after") {
        const d = new Date(value);
        if (!isNaN(d.getTime())) after = d;
      }
      if (k === "before") {
        const d = new Date(value);
        if (!isNaN(d.getTime())) before = d;
      }
      if (k === "is" && ["high", "medium", "low"].includes(value.toLowerCase())) {
        isPriority = value.toLowerCase() as Priority;
      }
      return "";
    })
    .replace(/\s+/g, " ")
    .trim();

  return { freeText, from, after, before, isPriority, hasAttachmentRequested };
}
