// Metadata visual por programa, compartida entre la vista previa del
// certificado (cliente) y el generador de PDF (servidor) para que ambas
// superficies muestren siempre el mismo color de acento por programa.
export type ProgramMeta = { icon: string; accent: string; desc: string }

export const PROGRAM_META: Record<string, ProgramMeta> = {
  "life-coaching-integrativo": { icon: "⟡", accent: "#A58D66", desc: "Life Coaching Integrativo" },
  "joogal-adultos":            { icon: "✦", accent: "#C49F72", desc: "Instructor Jewgal · Adultos" },
  "joogalkids":                { icon: "★", accent: "#A76D61", desc: "Instructor Joogalkids" },
  "metodo-sholem":             { icon: "◈", accent: "#A76D61", desc: "Método Sholem" },
  "cabala-coach":              { icon: "❂", accent: "#CBB78B", desc: "Cábala Coach" },
}

export const DEFAULT_PROGRAM_META: ProgramMeta = { icon: "✦", accent: "#A58D66", desc: "" }

export function getProgramMeta(slug: string): ProgramMeta {
  return PROGRAM_META[slug] ?? DEFAULT_PROGRAM_META
}
