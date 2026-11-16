import type { ReactNode } from "react"
import { safeUrl } from "./markdown-text"

/**
 * Markdown ligero y SEGURO para los artículos del blog.
 * No usa dangerouslySetInnerHTML: todo se convierte en elementos de React, así que un texto pegado
 * no puede inyectar HTML ni scripts. Los artículos escritos como texto plano (párrafos separados por
 * una línea en blanco) siguen viéndose igual.
 *
 * Soporta: # / ## / ### títulos · **negrita** · *cursiva* · `código` · [texto](enlace) · ![alt](imagen)
 *          listas con "-" o "1." · > citas · --- separador · bloques de código con ```
 */

type Block =
  | { t: "h"; level: 2 | 3 | 4; text: string }
  | { t: "p"; lines: string[] }
  | { t: "ul" | "ol"; items: string[] }
  | { t: "quote"; lines: string[] }
  | { t: "hr" }
  | { t: "img"; alt: string; src: string }
  | { t: "code"; text: string }

const RE_HR = /^\s{0,3}(?:-\s*){3,}$|^\s{0,3}(?:\*\s*){3,}$|^\s{0,3}(?:_\s*){3,}$/
const RE_HEADING = /^\s{0,3}(#{1,4})\s+(.+?)\s*#*\s*$/
const RE_IMG_LINE = /^\s*!\[([^\]]*)\]\(([^)\s]+)\)\s*$/
const RE_UL = /^\s*[-*+]\s+(.*)$/
const RE_OL = /^\s*\d+[.)]\s+(.*)$/
const RE_QUOTE = /^\s{0,3}>\s?(.*)$/
const RE_FENCE = /^\s{0,3}```/

function startsBlock(line: string): boolean {
  return RE_FENCE.test(line) || RE_HR.test(line) || RE_HEADING.test(line) || RE_IMG_LINE.test(line) || RE_UL.test(line) || RE_OL.test(line) || RE_QUOTE.test(line)
}

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n")
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }

    if (RE_FENCE.test(line)) {
      const buf: string[] = []
      i++
      while (i < lines.length && !RE_FENCE.test(lines[i])) buf.push(lines[i++])
      i++ // cierre (o fin del texto)
      blocks.push({ t: "code", text: buf.join("\n") })
      continue
    }
    if (RE_HR.test(line)) { blocks.push({ t: "hr" }); i++; continue }

    const h = RE_HEADING.exec(line)
    if (h) {
      const n = h[1].length
      blocks.push({ t: "h", level: n <= 2 ? 2 : n === 3 ? 3 : 4, text: h[2] })
      i++
      continue
    }

    const img = RE_IMG_LINE.exec(line)
    if (img) { blocks.push({ t: "img", alt: img[1], src: img[2] }); i++; continue }

    if (RE_QUOTE.test(line)) {
      const buf: string[] = []
      while (i < lines.length && RE_QUOTE.test(lines[i])) buf.push(RE_QUOTE.exec(lines[i])![1]), i++
      blocks.push({ t: "quote", lines: buf })
      continue
    }

    if (RE_UL.test(line)) {
      const items: string[] = []
      while (i < lines.length && RE_UL.test(lines[i])) items.push(RE_UL.exec(lines[i])![1]), i++
      blocks.push({ t: "ul", items })
      continue
    }
    if (RE_OL.test(line)) {
      const items: string[] = []
      while (i < lines.length && RE_OL.test(lines[i])) items.push(RE_OL.exec(lines[i])![1]), i++
      blocks.push({ t: "ol", items })
      continue
    }

    // Párrafo: líneas seguidas hasta una línea en blanco o el inicio de otro bloque.
    const buf: string[] = [line]
    i++
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i])) buf.push(lines[i++])
    blocks.push({ t: "p", lines: buf })
  }
  return blocks
}

// Orden de las alternativas: imagen, enlace, negrita, cursiva, código.
const INLINE = /!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^\n]+?)\*\*|\*([^*\s][^*\n]*?)\*|`([^`\n]+)`/g

function renderInline(text: string, keyPrefix: string, depth = 0): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let n = 0
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0
    if (at > last) out.push(text.slice(last, at))
    const key = `${keyPrefix}-${n++}`
    if (m[2] !== undefined) {
      const src = safeUrl(m[2], { mailto: false })
      // eslint-disable-next-line @next/next/no-img-element -- imágenes del artículo desde cualquier origen (Cloudinary u otro)
      out.push(src ? <img key={key} src={src} alt={m[1]} loading="lazy" /> : m[0])
    } else if (m[4] !== undefined) {
      const href = safeUrl(m[4])
      const external = href ? /^https?:\/\//i.test(href) : false
      out.push(
        href
          ? <a key={key} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{depth < 2 ? renderInline(m[3], key, depth + 1) : m[3]}</a>
          : m[3],
      )
    } else if (m[5] !== undefined) {
      out.push(<strong key={key}>{depth < 2 ? renderInline(m[5], key, depth + 1) : m[5]}</strong>)
    } else if (m[6] !== undefined) {
      out.push(<em key={key}>{depth < 2 ? renderInline(m[6], key, depth + 1) : m[6]}</em>)
    } else if (m[7] !== undefined) {
      out.push(<code key={key}>{m[7]}</code>)
    }
    last = at + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

function renderLines(lines: string[], keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = []
  lines.forEach((l, idx) => {
    if (idx > 0) out.push(<br key={`${keyPrefix}-br${idx}`} />)
    out.push(...renderInline(l.trim(), `${keyPrefix}-l${idx}`))
  })
  return out
}

/** Dibuja un artículo. `className` por defecto "prose-jg" (estilos en globals.css). */
export function MarkdownLite({ source, className = "prose-jg" }: { source: string; className?: string }) {
  const blocks = parseBlocks(source ?? "")
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        const key = `b${i}`
        switch (b.t) {
          case "h": {
            const Tag = `h${b.level}` as "h2" | "h3" | "h4"
            return <Tag key={key}>{renderInline(b.text, key)}</Tag>
          }
          case "p": return <p key={key}>{renderLines(b.lines, key)}</p>
          case "ul": return <ul key={key}>{b.items.map((it, j) => <li key={j}>{renderInline(it, `${key}-${j}`)}</li>)}</ul>
          case "ol": return <ol key={key}>{b.items.map((it, j) => <li key={j}>{renderInline(it, `${key}-${j}`)}</li>)}</ol>
          case "quote": return <blockquote key={key}><p>{renderLines(b.lines, key)}</p></blockquote>
          case "hr": return <hr key={key} />
          case "code": return <pre key={key}><code>{b.text}</code></pre>
          case "img": {
            const src = safeUrl(b.src, { mailto: false })
            // eslint-disable-next-line @next/next/no-img-element -- ver arriba
            return src ? <figure key={key}><img src={src} alt={b.alt} loading="lazy" />{b.alt ? <figcaption>{b.alt}</figcaption> : null}</figure> : null
          }
        }
      })}
    </div>
  )
}
