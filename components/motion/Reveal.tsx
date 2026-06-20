"use client"

import { useRef } from "react"
import { motion, useInView, type Variants } from "framer-motion"

const ease = [0.22, 1, 0.36, 1] as const

/** Generic scroll reveal: fade + rise + soft blur */
export function Reveal({
  children,
  delay = 0,
  y = 32,
  className = "",
  once = true,
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
  once?: boolean
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once, margin: "-90px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.85, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Line-by-line text reveal with overflow mask (editorial luxury) */
export function RevealText({
  text,
  className = "",
  delay = 0,
  stagger = 0.08,
  as: Tag = "span",
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
  as?: React.ElementType
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const lines = text.split("\n")

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  }
  const line: Variants = {
    hidden: { y: "110%" },
    show: { y: "0%", transition: { duration: 0.9, ease } },
  }

  return (
    <Tag ref={ref} className={className}>
      <motion.span variants={container} initial="hidden" animate={inView ? "show" : "hidden"} style={{ display: "block" }}>
        {lines.map((l, i) => (
          <span key={i} className="reveal-mask">
            <motion.span variants={line} style={{ display: "block" }}>
              {l}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}

/** Word-by-word reveal */
export function RevealWords({
  text,
  className = "",
  delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const words = text.split(" ")
  return (
    <span ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i} className="reveal-mask" style={{ display: "inline-block", marginRight: "0.25em" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%" }}
            animate={inView ? { y: "0%" } : {}}
            transition={{ duration: 0.7, delay: delay + i * 0.04, ease }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
