"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Video, BookOpen, Quote, Link2 } from "lucide-react"
import type { ContentBlock } from "@/lib/materials-content"
import { getYouTubeEmbedUrl, getVimeoEmbedUrl } from "@/lib/program-content"

function SlidesBlockView({ images, captions }: { images: string[]; captions?: string[] }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  if (images.length === 0) return null
  const total = images.length

  function go(delta: number) {
    setDirection(delta)
    setIndex((i) => (i + delta + total) % total)
  }

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", background: "var(--surface)", border: "1px solid rgba(165,141,102,.14)" }}>
      <div style={{ position: "relative", background: "var(--bg-3)", height: 480, overflow: "hidden" }}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={index}
            src={images[index]}
            alt={captions?.[index] ?? `Diapositiva ${index + 1}`}
            custom={direction}
            initial={{ opacity: 0, x: direction >= 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -50 : 50 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
          />
        </AnimatePresence>
        {total > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Diapositiva anterior"
              style={{
                position: "absolute", top: "50%", left: 8, transform: "translateY(-50%)", zIndex: 1,
                width: 32, height: 32, borderRadius: "50%", border: "none",
                background: "rgba(0,0,0,.45)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Siguiente diapositiva"
              style={{
                position: "absolute", top: "50%", right: 8, transform: "translateY(-50%)", zIndex: 1,
                width: 32, height: 32, borderRadius: "50%", border: "none",
                background: "rgba(0,0,0,.45)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", fontSize: 12, color: "var(--text-faint)" }}>
        <span>{captions?.[index] ?? ""}</span>
        {total > 1 && <span>{index + 1} / {total}</span>}
      </div>
    </div>
  )
}

// Botón de play centrado sobre una portada — mismo peso visual en los 3
// lugares que lo usan (hero youtube/vimeo con posterUrl, cada ítem de la
// grilla de sub-clips).
function PlayOverlay() {
  return (
    <div style={{
      position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,.22)",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,.92)",
        display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,.35)",
      }}>
        <Play size={22} style={{ color: "#2C1F14", marginLeft: 3 }} fill="#2C1F14" />
      </div>
    </div>
  )
}

// YouTube/Vimeo con portada propia: no monta el iframe (ni carga el chrome
// de la plataforma) hasta que el alumno hace clic — si no hay posterUrl,
// se comporta exactamente como antes (iframe directo).
function EmbedVideoBlock({ embedUrl, posterUrl, caption }: { embedUrl: string; posterUrl?: string; caption?: string }) {
  const [revealed, setRevealed] = useState(!posterUrl)
  return (
    <div>
      <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 10, overflow: "hidden", background: "var(--bg-3)" }}>
        {revealed ? (
          <iframe
            src={embedUrl}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <button
            onClick={() => setRevealed(true)}
            aria-label="Reproducir video"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer", background: "none" }}
          >
            <img src={posterUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <PlayOverlay />
          </button>
        )}
      </div>
      {caption && <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 6 }}>{caption}</p>}
    </div>
  )
}

type VideoGridItem = {
  title: string
  durationLabel?: string
  provider: "cloudinary" | "youtube" | "vimeo"
  url: string
  posterUrl?: string
}

function resolveGridEmbed(item: VideoGridItem): { kind: "video"; src: string } | { kind: "iframe"; src: string } | null {
  if (item.provider === "cloudinary") return { kind: "video", src: item.url }
  const embedUrl = item.provider === "youtube" ? getYouTubeEmbedUrl(item.url) : getVimeoEmbedUrl(item.url)
  return embedUrl ? { kind: "iframe", src: embedUrl } : null
}

function VideoGridCard({ item }: { item: VideoGridItem }) {
  const [open, setOpen] = useState(false)
  const resolved = resolveGridEmbed(item)

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", background: "var(--surface)", border: "1px solid rgba(165,141,102,.14)" }}>
      <div style={{ position: "relative", paddingTop: "56.25%", background: "var(--bg-3)" }}>
        {open && resolved ? (
          resolved.kind === "video" ? (
            <video controls autoPlay poster={item.posterUrl} src={resolved.src} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
          ) : (
            <iframe
              src={resolved.src}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            />
          )
        ) : (
          <button
            onClick={() => setOpen(true)}
            disabled={!resolved}
            aria-label={`Reproducir ${item.title}`}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", padding: 0, cursor: resolved ? "pointer" : "default", background: "none" }}
          >
            {item.posterUrl && <img src={item.posterUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
            {resolved && <PlayOverlay />}
          </button>
        )}
      </div>
      <div style={{ padding: "10px 12px" }}>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}>{item.title}</p>
        {item.durationLabel && <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 3 }}>{item.durationLabel}</p>}
      </div>
    </div>
  )
}

type LinkItem = { label: string; url: string }

function ResourceCategory({ icon, label, items, render }: { icon: React.ReactNode; label: string; items: unknown[]; render: () => React.ReactNode }) {
  if (items.length === 0) return null
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        {icon}
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{label}</span>
        <span style={{ fontSize: 11, color: "var(--text-faint)" }}>· {items.length}</span>
      </div>
      {render()}
    </div>
  )
}

function LinkList({ items }: { items: LinkItem[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((it, i) => (
        <a key={i} href={it.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--gold)", textDecoration: "none" }}>
          {it.label} ↗
        </a>
      ))}
    </div>
  )
}

export default function ContentBlockView({ block }: { block: ContentBlock }) {
  if (block.type === "heading") {
    const size = block.level === 1 ? 20 : block.level === 2 ? 17 : 15
    return (
      <p style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: size, color: "var(--text)", marginTop: block.level === 1 ? 6 : 2 }}>
        {block.text}
      </p>
    )
  }
  if (block.type === "paragraph") {
    return <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>{block.text}</p>
  }
  if (block.type === "list") {
    const Tag = block.ordered ? "ol" : "ul"
    return (
      <Tag style={{ margin: 0, paddingLeft: 22, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>
        {block.items.map((item, i) => <li key={i}>{item}</li>)}
      </Tag>
    )
  }
  if (block.type === "divider") {
    return <hr style={{ border: "none", borderTop: "1px dashed rgba(165,141,102,.25)", margin: "6px 0" }} />
  }
  if (block.type === "video-youtube" || block.type === "video-vimeo") {
    const embedUrl = block.type === "video-youtube" ? getYouTubeEmbedUrl(block.url) : getVimeoEmbedUrl(block.url)
    if (!embedUrl) return null
    return <EmbedVideoBlock embedUrl={embedUrl} posterUrl={block.posterUrl} caption={block.caption} />
  }
  if (block.type === "slides") {
    return <SlidesBlockView images={block.images} captions={block.captions} />
  }
  if (block.type === "video-cloudinary") {
    return (
      <div>
        <video controls poster={block.posterUrl} src={block.url} style={{ width: "100%", borderRadius: 10, display: "block", background: "var(--bg-3)" }} />
        {block.caption && <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 6 }}>{block.caption}</p>}
      </div>
    )
  }
  if (block.type === "video-grid") {
    return (
      <div>
        {block.title && <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>{block.title}</p>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {block.items.map((item, i) => <VideoGridCard key={i} item={item} />)}
        </div>
      </div>
    )
  }
  if (block.type === "unit-resources") {
    const hasAny = block.videos.length + block.readings.length + block.quotes.length + block.links.length > 0
    if (!hasAny) return null
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "14px 16px", borderRadius: 10, background: "var(--surface)", border: "1px solid rgba(165,141,102,.14)" }}>
        <ResourceCategory icon={<Video size={14} style={{ color: "var(--gold)" }} />} label="Videos recomendados" items={block.videos} render={() => <LinkList items={block.videos} />} />
        <ResourceCategory icon={<BookOpen size={14} style={{ color: "var(--gold)" }} />} label="Lecturas complementarias" items={block.readings} render={() => <LinkList items={block.readings} />} />
        <ResourceCategory icon={<Quote size={14} style={{ color: "var(--gold)" }} />} label="Citas para reflexionar" items={block.quotes} render={() => (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {block.quotes.map((q, i) => (
              <p key={i} style={{ fontSize: 13, fontStyle: "italic", color: "var(--text-muted)", borderLeft: "2px solid var(--gold)", paddingLeft: 10 }}>{q}</p>
            ))}
          </div>
        )} />
        <ResourceCategory icon={<Link2 size={14} style={{ color: "var(--gold)" }} />} label="Enlaces de interés" items={block.links} render={() => <LinkList items={block.links} />} />
      </div>
    )
  }
  return null
}
