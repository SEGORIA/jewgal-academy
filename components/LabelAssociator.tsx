"use client"

import { useEffect } from "react"

/**
 * Accesibilidad: en el aula y el panel hay decenas de formularios con el patrón
 *   <div><label>Nombre</label><input …/></div>
 * donde la etiqueta se ve pero NO está vinculada al campo, así que un lector de pantalla anuncia
 * "campo de texto" sin decir de qué es, y al tocar la etiqueta no se enfoca el campo.
 *
 * Este componente vincula (for/id) cada <label> sin `for` con su campo hermano (o el primer campo del
 * hermano siguiente, p. ej. un contenedor con el icono del ojo), y vuelve a hacerlo cuando aparecen
 * formularios nuevos (modales, pestañas). No toca etiquetas que ya estén vinculadas o que envuelvan el campo.
 */
const FIELD = "input:not([type=hidden]),select,textarea"
let seq = 0

function associate(root: ParentNode) {
  root.querySelectorAll<HTMLLabelElement>("label:not([for])").forEach((label) => {
    if (label.querySelector(FIELD)) return // ya envuelve su campo
    const next = label.nextElementSibling
    if (!next) return
    const field = next.matches(FIELD) ? (next as HTMLElement) : next.querySelector<HTMLElement>(FIELD)
    if (!field || (field as HTMLInputElement).labels?.length) return
    if (!field.id) field.id = `auto-field-${++seq}`
    label.setAttribute("for", field.id)
  })
}

export default function LabelAssociator() {
  useEffect(() => {
    associate(document)
    let raf = 0
    const obs = new MutationObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => associate(document))
    })
    obs.observe(document.body, { childList: true, subtree: true })
    return () => { obs.disconnect(); cancelAnimationFrame(raf) }
  }, [])
  return null
}
