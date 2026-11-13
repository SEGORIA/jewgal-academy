export type Enrollment = {
  id: string
  courseId: string
  status: string
  progress: number
  hoursCompleted: number
  completedAt: string | null
  certificateNumber: string | null
  certificateUrl: string | null
  attendance: { attended: number; held: number; rate: number | null }
  course: { title: string; slug: string; totalHours: number | null }
}

export type StudentPayment = {
  id: string
  amount: number
  currency: string
  status: string
  method: string | null
  note: string | null
  paidAt: string | null
  createdAt: string
  course: { title: string }
}

export type Student = {
  id: string
  name: string
  email: string
  status: string
  phone: string | null
  country: string | null
  city: string | null
  job: string | null
  bio: string | null
  createdAt: string
  lastLoginAt: string | null
  enrollments: Enrollment[]
  payments: StudentPayment[]
}

export type CourseOption = { id: string; title: string; price?: number; currency?: string }

export type DetailTab = "programas" | "datos" | "pagos"

export const fmtDate = (iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  iso ? new Date(iso).toLocaleDateString("es", opts) : "—"

export const money = (amount: number, currency = "USD") =>
  `${currency === "USD" ? "US$" : currency + " "}${amount.toLocaleString("es", { maximumFractionDigits: 2 })}`

/** Pagos que cuentan como ingreso real (los pendientes, fallidos y reembolsados no suman). */
export const countsAsIncome = (status: string) => status === "completed" || status === "demo"
