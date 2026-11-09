import type { ContentBlock } from "@/lib/materials-content"

// Convierte texto pegado desde Word / Google Docs / un PDF en bloques de lección
// (títulos, párrafos, listas). Es una heurística pensada para las guías de
// Jewgal: no intenta adivinar todo, solo lo que se reconoce con seguridad —
// el resto queda como párrafo y se puede ajustar a mano en el editor.

const MAX_LIST_ITEM = 300 // límite del esquema de listas
const MAX_PARAGRAPH = 4000 // límite del esquema de párrafos
const MAX_LIST_ITEMS = 50

const BULLET = /^\s*[-–—•·*▪◦✓✔►]\s+(.*\S)\s*$/
const NUMBERED = /^\s*(\d{1,2})[.)]\s+(.*\S)\s*$/
const SECTION_NUMBER = /^\s*(\d{1,2}\.\d{1,2}(?:\.\d{1,2})?)\s+(\S.*)$/ // "1.1 Título", "2.3.1 Título"
const UNIT_HEADING = /^\s*(UNIDAD|Unidad|SESI[ÓO]N|Sesi[óo]n|M[ÓO]DULO|M[óo]dulo)\s+\d+\s*[—–:.-]\s*\S/
const MD_HEADING = /^(#{1,3})\s+(\S.*)$/

function isAllCaps(s: string) {
  const letters = s.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "")
  return letters.length >= 4 && letters === letters.toUpperCase() && !/[.!?]$/.test(s.trim())
}

// Parte un texto largo en pedazos que entren en el límite, cortando en fin de oración.
function chunkText(text: string, max: number): string[] {
  if (text.length <= max) return [text]
  const out: string[] = []
  let rest = text
  while (rest.length > max) {
    let cut = rest.lastIndexOf(". ", max)
    if (cut < max * 0.5) cut = rest.lastIndexOf(" ", max)
    if (cut <= 0) cut = max
    out.push(rest.slice(0, cut + 1).trim())
    rest = rest.slice(cut + 1).trim()
  }
  if (rest) out.push(rest)
  return out
}

export function textToBlocks(raw: string): ContentBlock[] {
  const lines = raw.replace(/\r\n?/g, "\n").replace(/ /g, " ").split("\n").map((l) => l.replace(/\s+$/, ""))
  const blocks: ContentBlock[] = []

  let para: string[] = []
  let list: { ordered: boolean; items: string[] } | null = null

  const flushPara = () => {
    if (!para.length) return
    for (const chunk of chunkText(para.join(" ").replace(/\s+/g, " ").trim(), MAX_PARAGRAPH)) {
      if (chunk) blocks.push({ type: "paragraph", text: chunk })
    }
    para = []
  }
  const flushList = () => {
    if (!list) return
    // Un ítem que no entra en el límite de lista se vuelve párrafo (no se pierde texto).
    const items: string[] = []
    const flushItems = () => {
      if (items.length) { blocks.push({ type: "list", ordered: list!.ordered, items: items.splice(0).slice(0, MAX_LIST_ITEMS) }) }
    }
    for (const it of list.items) {
      if (it.length > MAX_LIST_ITEM) {
        flushItems()
        for (const c of chunkText(it, MAX_PARAGRAPH)) blocks.push({ type: "paragraph", text: c })
      } else if (items.length >= MAX_LIST_ITEMS) {
        flushItems()
        items.push(it)
      } else {
        items.push(it)
      }
    }
    flushItems()
    list = null
  }
  const flushAll = () => { flushPara(); flushList() }

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx]
    const t = line.trim()

    if (!t) { flushAll(); continue }

    // Tablas pegadas desde Word llegan separadas por tabulaciones: cada fila → un ítem
    if (line.includes("\t")) {
      const cells = line.split("\t").map((c) => c.trim()).filter(Boolean)
      if (cells.length >= 2) {
        flushPara()
        if (!list || list.ordered) { flushList(); list = { ordered: false, items: [] } }
        list.items.push(cells.join(" — "))
        continue
      }
    }

    const md = t.match(MD_HEADING)
    if (md) { flushAll(); blocks.push({ type: "heading", level: md[1].length as 1 | 2 | 3, text: md[2].trim() }); continue }

    if (UNIT_HEADING.test(t) && t.length <= 140) { flushAll(); blocks.push({ type: "heading", level: 1, text: t }); continue }

    const sec = t.match(SECTION_NUMBER)
    if (sec && t.length <= 140 && !/[.!?]$/.test(t)) {
      flushAll()
      blocks.push({ type: "heading", level: sec[1].split(".").length >= 3 ? 3 : 2, text: t })
      continue
    }

    if (isAllCaps(t) && t.length <= 90) { flushAll(); blocks.push({ type: "heading", level: 2, text: t }); continue }

    const bullet = t.match(BULLET)
    if (bullet) {
      flushPara()
      if (!list || list.ordered) { flushList(); list = { ordered: false, items: [] } }
      list.items.push(bullet[1].trim())
      continue
    }

    const num = t.match(NUMBERED)
    if (num) {
      flushPara()
      if (!list || !list.ordered) { flushList(); list = { ordered: true, items: [] } }
      list.items.push(num[2].trim())
      continue
    }

    // Texto normal. Una lista termina cuando aparece un párrafo.
    flushList()
    // Líneas cortadas a mano (Word/PDF): si la anterior no cerró la oración y esta
    // empieza en minúscula, es continuación del mismo párrafo.
    const prev = para[para.length - 1]
    if (prev && !/[.:;!?"”)»]$/.test(prev) && /^[a-záéíóúüñ(]/.test(t)) para.push(t)
    else { flushPara(); para.push(t) }
  }
  flushAll()

  return blocks
}
