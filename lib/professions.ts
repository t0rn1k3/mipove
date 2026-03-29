import type { Professions, SelectOption } from "./types";


export type ProfessionsTranslator = {
  (key: string): string;
  has: (key: string) => boolean;
};

export function mapProfessionsToSelectOptions(
  items: Professions[],
  tp: ProfessionsTranslator,
): SelectOption[] {
  return items.map((p) => ({
    value: p.id,
    label: tp.has(p.id) ? tp(p.id) : p.label,
  }));
}

export function translateProfessionDisplay(
  raw: string | undefined | null,
  tp: ProfessionsTranslator,
): string {
  const s = (raw ?? "").trim();
  if (!s) return "";
  if (tp.has(s)) return tp(s);
  return s;
}

export function specialtyQueryParamForApi(
  value: string,
  professions: Professions[],
): string {
  const v = value.trim();
  if (!v) return "";
  const match = professions.find((p) => p.id === v);
  return match?.label ?? v;
}
