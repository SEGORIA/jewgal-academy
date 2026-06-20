"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function MagneticButton({
  children,
  href,
  className = "",
  strength = 0.35,
}: {
  children: React.ReactNode
  href: string
  className?: string
  strength?: number
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    setPos({ x, y })
  }

  return (
    <motion.span
      style={{ display: "inline-block" }}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.4 }}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
    >
      <Link ref={ref} href={href} data-cursor="grow" className={className}>
        {children}
      </Link>
    </motion.span>
  )
}
