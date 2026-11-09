// Desbloqueo progresivo. Dado el orden del programa (solo lo visible) y qué completó
// el alumno, devuelve qué materiales siguen bloqueados.
//
// Regla: un material está accesible si ya lo completó, o si es el primero que le
// falta. Todo lo que viene después de ese primero pendiente está bloqueado.
// Así no se le quita acceso a nada que ya hizo (aunque lo haya completado fuera de
// orden) y siempre tiene exactamente un "siguiente paso".
export function computeLockedIds(items: { id: string; progress?: { completedAt: string | Date | null } | null }[]): Set<string> {
  const locked = new Set<string>()
  let blocked = false
  for (const it of items) {
    const done = !!it.progress?.completedAt
    if (blocked && !done) locked.add(it.id)
    if (!done) blocked = true
  }
  return locked
}

// El primer material pendiente: lo que el alumno tiene que completar para seguir.
export function firstPending<T extends { id: string; progress?: { completedAt: string | Date | null } | null }>(items: T[]): T | null {
  return items.find((it) => !it.progress?.completedAt) ?? null
}
