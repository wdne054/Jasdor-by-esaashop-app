"use client"

import { useEffect, useState } from "react"

export const ROOMS = [
  { id: "vs1", name: "VS Phone 1" },
  { id: "vs2", name: "VS Phone 2" },
  { id: "vs3", name: "VS Phone 3" },
  { id: "vs4", name: "VS Phone 4" },
  { id: "vmos", name: "VMOS" },
] as const

export const SLOTS_PER_ROOM = 3

export type Slot = {
  number: string
  used: boolean
  buyer: string
  usedAt: number | null
}

export type HistoryEntry = {
  id: string
  roomId: string
  roomName: string
  slot: number
  number: string
  buyer: string
  at: number
}

export type AppData = {
  rooms: Record<string, Slot[]>
  history: HistoryEntry[]
}

const STORAGE_KEY = "jasdor.v1"

function emptySlot(): Slot {
  return { number: "", used: false, buyer: "", usedAt: null }
}

function emptyRoom(): Slot[] {
  return Array.from({ length: SLOTS_PER_ROOM }, emptySlot)
}

export function initialData(): AppData {
  const rooms: Record<string, Slot[]> = {}
  for (const r of ROOMS) rooms[r.id] = emptyRoom()
  return { rooms, history: [] }
}

/** Guarantees exactly the 5 fixed rooms with exactly 3 slots each. */
function normalize(raw: unknown): AppData {
  const data = initialData()
  if (!raw || typeof raw !== "object") return data
  const input = raw as Partial<AppData>

  for (const r of ROOMS) {
    const slots = input.rooms?.[r.id]
    if (!Array.isArray(slots)) continue
    for (let i = 0; i < SLOTS_PER_ROOM; i++) {
      const s = slots[i] as Partial<Slot> | undefined
      if (!s) continue
      data.rooms[r.id][i] = {
        number: typeof s.number === "string" ? s.number : "",
        used: Boolean(s.used),
        buyer: typeof s.buyer === "string" ? s.buyer : "",
        usedAt: typeof s.usedAt === "number" ? s.usedAt : null,
      }
    }
  }

  if (Array.isArray(input.history)) {
    data.history = input.history
      .filter((h): h is HistoryEntry => Boolean(h) && typeof h.number === "string")
      .map((h) => ({
        id: String(h.id ?? `${h.at}-${h.number}`),
        roomId: String(h.roomId ?? ""),
        roomName: String(h.roomName ?? ""),
        slot: Number(h.slot ?? 0),
        number: h.number,
        buyer: typeof h.buyer === "string" ? h.buyer : "",
        at: Number(h.at ?? Date.now()),
      }))
      .sort((a, b) => b.at - a.at)
  }

  return data
}

let state: AppData | null = null
const listeners = new Set<() => void>()

function read(): AppData {
  if (state) return state
  if (typeof window === "undefined") return initialData()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    state = normalize(raw ? JSON.parse(raw) : null)
  } catch {
    state = initialData()
  }
  return state
}

function write(next: AppData) {
  state = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch (err) {
    console.log("[v0] failed to save to localStorage:", err)
  }
  listeners.forEach((l) => l())
}

function update(fn: (draft: AppData) => void) {
  const next: AppData = JSON.parse(JSON.stringify(read()))
  fn(next)
  write(next)
}

/** Subscribe to the store. Returns null until mounted on the client. */
export function useAppData(): AppData | null {
  const [data, setData] = useState<AppData | null>(null)

  useEffect(() => {
    setData(read())
    const listener = () => setData(read())
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return data
}

/* ---------- actions ---------- */

export function roomName(roomId: string) {
  return ROOMS.find((r) => r.id === roomId)?.name ?? roomId
}

export function setSlotNumber(roomId: string, index: number, number: string) {
  update((d) => {
    const slot = d.rooms[roomId]?.[index]
    if (!slot || slot.used) return
    slot.number = number.trim()
  })
}

export function clearSlot(roomId: string, index: number) {
  update((d) => {
    if (!d.rooms[roomId]) return
    d.rooms[roomId][index] = emptySlot()
  })
}

export function markUsed(roomId: string, index: number, buyer: string) {
  update((d) => {
    const slot = d.rooms[roomId]?.[index]
    if (!slot || !slot.number || slot.used) return
    const at = Date.now()
    slot.used = true
    slot.buyer = buyer.trim()
    slot.usedAt = at
    d.history.unshift({
      id: `${at}-${roomId}-${index}`,
      roomId,
      roomName: roomName(roomId),
      slot: index + 1,
      number: slot.number,
      buyer: slot.buyer,
      at,
    })
  })
}

export function parseNumbers(input: string): string[] {
  return input
    .split(/[\s,;]+/)
    .map((n) => n.trim())
    .filter(Boolean)
}

/** Fills empty (unused, blank) slots with the given numbers, in order. */
export function fillEmptySlots(roomId: string, numbers: string[]) {
  update((d) => {
    const slots = d.rooms[roomId]
    if (!slots) return
    let i = 0
    for (const slot of slots) {
      if (i >= numbers.length) break
      if (!slot.used && !slot.number) {
        slot.number = numbers[i]
        i++
      }
    }
  })
}

/** Resets the room back to 3 empty slots. History is kept. */
export function resetRoom(roomId: string) {
  update((d) => {
    if (!d.rooms[roomId]) return
    d.rooms[roomId] = emptyRoom()
  })
}

export function resetAll() {
  write(initialData())
}

/* ---------- derived helpers ---------- */

export function usedCount(slots: Slot[]) {
  return slots.filter((s) => s.used).length
}

export function unusedNumbers(slots: Slot[]) {
  return slots.filter((s) => !s.used && s.number).map((s) => s.number)
}

export function isRoomFinished(slots: Slot[]) {
  return slots.length > 0 && slots.every((s) => s.used)
}

export function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (err) {
    console.log("[v0] clipboard API failed, using fallback:", err)
  }
  try {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.style.position = "fixed"
    ta.style.opacity = "0"
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(ta)
    return ok
  } catch (err) {
    console.log("[v0] clipboard fallback failed:", err)
    return false
  }
}
