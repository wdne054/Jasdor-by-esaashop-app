"use client"

import { useEffect, useState } from "react"

export const ROOMS = [
  { id: "vs1", name: "ROOM 1" },
  { id: "vs2", name: "ROOM 2" },
  { id: "vs3", name: "ROOM 3" },
  { id: "vs4", name: "ROOM 4" },
  { id: "vmos", name: "ROOM 5" },
] as const

export const SLOTS_PER_ROOM = 3

/** Setiap nomor bisa dipakai 3 kali (3 voucher). */
export const USES_PER_NUMBER = 3

export const DEFAULT_PINS: Record<string, string> = {
  vs1: "111111",
  vs2: "222222",
  vs3: "333333",
  vs4: "444444",
  vmos: "555555",
}

export type VoucherType = "VC 35" | "VC 50" | "VC 70"

export const VOUCHER_TYPES: VoucherType[] = [
  "VC 35",
  "VC 50",
  "VC 70",
]

export type Slot = {
  number: string
  /** true kalau semua voucher sudah dipakai */
  used: boolean
  /** jumlah voucher yang masih tersedia */
  usesLeft: number
  /** status masing-masing voucher */
  vouchers: Record<VoucherType, boolean>
  /** pembeli terakhir */
  buyer: string
  /** waktu pemakaian terakhir */
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
  /** pemakaian ke-berapa dari 3 */
  useNo: number
  /** sisa voucher setelah pemakaian ini */
  usesLeft: number
}
export type FinanceData = {
  income: number
  otpCost: number
  roomCost: number
  expenses: number
}

export type RoomInfo = {
  id: string
  name: string
}

export type AppData = {
  rooms: Record<string, Slot[]>
  pins: Record<string, string>
  roomOrder: string[]
  roomNames: Record<string, string>
  history: HistoryEntry[]
  finance: FinanceData
}

const STORAGE_KEY = "jasdor.v1"

function emptySlot(): Slot {
  return {
    number: "",
    used: false,
    usesLeft: USES_PER_NUMBER,
    vouchers: {
      "VC 35": false,
      "VC 50": false,
      "VC 70": false,
    },
    buyer: "",
    usedAt: null,
  }
}

function emptyRoom(): Slot[] {
  return Array.from({ length: SLOTS_PER_ROOM }, emptySlot)
}

function defaultPins(): Record<string, string> {
  const pins: Record<string, string> = {}
  for (const r of ROOMS) pins[r.id] = DEFAULT_PINS[r.id]
  return pins
}

export function initialData(): AppData {
  const rooms: Record<string, Slot[]> = {}
  const roomNames: Record<string, string> = {}

  for (const r of ROOMS) {
    rooms[r.id] = emptyRoom()
    roomNames[r.id] = r.name
  }

  return {
    rooms,
    pins: defaultPins(),
    roomOrder: ROOMS.map((r) => r.id),
    roomNames,
    history: [],
    finance: {
      income: 0,
      otpCost: 0,
      roomCost: 0,
      expenses: 0,
    },
  }
}

function clampUses(n: unknown, fallback: number) {
  const v = typeof n === "number" && Number.isFinite(n) ? Math.floor(n) : fallback
  return Math.min(USES_PER_NUMBER, Math.max(0, v))
}

/** Guarantees exactly the 5 fixed rooms with exactly 3 slots each. */
function normalize(raw: unknown): AppData {
  const data = initialData()
  if (!raw || typeof raw !== "object") return data
  const input = raw as Partial<AppData>

  const roomOrder = Array.isArray(input.roomOrder)
    ? input.roomOrder.filter(
        (id): id is string => typeof id === "string" && id.trim().length > 0,
      )
    : ROOMS.map((r) => r.id)

  const roomNames =
    input.roomNames && typeof input.roomNames === "object"
      ? { ...input.roomNames }
      : {}

  for (const r of ROOMS) {
    if (!roomOrder.includes(r.id)) {
      roomOrder.push(r.id)
    }

    if (
      typeof roomNames[r.id] !== "string" ||
      !roomNames[r.id].trim()
    ) {
      roomNames[r.id] = r.name
    }
  }

  data.roomOrder = [...new Set(roomOrder)]
  data.roomNames = roomNames

  for (const roomId of data.roomOrder) {
    if (!data.rooms[roomId]) {
      data.rooms[roomId] = emptyRoom()
    }

    if (!data.pins[roomId]) {
      data.pins[roomId] = ""
    }
    const slots = input.rooms?.[roomId]

    if (Array.isArray(slots)) {
      for (let i = 0; i < SLOTS_PER_ROOM; i++) {
        const s = slots[i] as Partial<Slot> | undefined
        if (!s) continue

        const number = typeof s.number === "string" ? s.number : ""

const oldUsesLeft = clampUses(
  s.usesLeft,
  s.used ? 0 : USES_PER_NUMBER,
)

const vouchers =
  s.vouchers && typeof s.vouchers === "object"
    ? {
        "VC 35": Boolean(s.vouchers["VC 35"]),
        "VC 50": Boolean(s.vouchers["VC 50"]),
        "VC 70": Boolean(s.vouchers["VC 70"]),
      }
    : {
        "VC 35": oldUsesLeft <= 2,
        "VC 50": oldUsesLeft <= 1,
        "VC 70": oldUsesLeft <= 0,
      }

const usesLeft = VOUCHER_TYPES.filter(
  (type) => !vouchers[type],
).length

data.rooms[roomId][i] = {
  number,
  usesLeft,
  used: Boolean(number) && usesLeft === 0,
  vouchers,
  buyer: typeof s.buyer === "string" ? s.buyer : "",
  usedAt: typeof s.usedAt === "number" ? s.usedAt : null,
}
      }
    }

    const pin = input.pins?.[roomId]

    if (typeof pin === "string" && pin.trim()) {
      data.pins[roomId] = pin.trim().slice(0, 12)
    }
  }
data.roomOrder = data.roomOrder.filter((id) => data.rooms[id])
data.roomNames = Object.fromEntries(
  data.roomOrder.map((id, index) => [
    id,
    typeof data.roomNames[id] === "string" && data.roomNames[id].trim()
      ? data.roomNames[id]
      : `ROOM ${index + 1}`,
  ]),
)
  if (Array.isArray(input.history)) {
    data.history = input.history
      .filter(
        (h): h is HistoryEntry =>
          Boolean(h) && typeof h.number === "string",
      )
      .map((h) => ({
        id: String(h.id ?? `${h.at}-${h.number}`),
        roomId: String(h.roomId ?? ""),
        roomName: String(h.roomName ?? ""),
        slot: Number(h.slot ?? 0),
        number: h.number,
        buyer: typeof h.buyer === "string" ? h.buyer : "",
        at: Number(h.at ?? Date.now()),
        useNo: clampUses(h.useNo, USES_PER_NUMBER) || USES_PER_NUMBER,
        usesLeft: clampUses(h.usesLeft, 0),
      }))
      .sort((a, b) => b.at - a.at)
  }

  const finance = input.finance

  if (finance && typeof finance === "object") {
    data.finance = {
      income:
        typeof finance.income === "number" && Number.isFinite(finance.income)
          ? finance.income
          : 0,
      otpCost:
        typeof finance.otpCost === "number" && Number.isFinite(finance.otpCost)
          ? finance.otpCost
          : 0,
      roomCost:
        typeof finance.roomCost === "number" && Number.isFinite(finance.roomCost)
          ? finance.roomCost
          : 0,
      expenses:
        typeof finance.expenses === "number" && Number.isFinite(finance.expenses)
          ? finance.expenses
          : 0,
    }
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
  return state?.roomNames?.[roomId] ?? ROOMS.find((r) => r.id === roomId)?.name ?? roomId
}
export function getRooms(data: AppData | null): RoomInfo[] {
  if (!data) return []

  return data.roomOrder.map((id, index) => ({
    id,
    name: data.roomNames?.[id] ?? `ROOM ${index + 1}`,
  }))
}
export function roomPin(data: AppData | null, roomId: string) {
  return data?.pins?.[roomId] ?? DEFAULT_PINS[roomId] ?? ""
}
export function addRoom() {
  update((d) => {
    let number = d.roomOrder.length + 1
    let id = `room-${number}`

    while (d.rooms[id]) {
      number += 1
      id = `room-${number}`
    }

    d.roomOrder.push(id)
    d.roomNames[id] = `ROOM ${number}`
    d.rooms[id] = emptyRoom()
    d.pins[id] = ""
  })
}
export function removeRoom(roomId: string) {
  update((d) => {
    if (!d.roomOrder.includes(roomId)) return

    d.roomOrder = d.roomOrder.filter((id) => id !== roomId)
    delete d.rooms[roomId]
    delete d.pins[roomId]
    delete d.roomNames[roomId]
  })
      }
export function setRoomPin(roomId: string, pin: string) {
  update((d) => {
    if (!d.rooms[roomId]) return
    const clean = pin.replace(/\s+/g, "").slice(0, 12)
    d.pins[roomId] = clean || DEFAULT_PINS[roomId]
  })
}
export function setFinance(
  field: "income" | "otpCost" | "roomCost" | "expenses",
  value: number
) {
  update((d) => {
    d.finance[field] = Number.isFinite(value) && value >= 0 ? value : 0
  })
      }
export function setSlotNumber(roomId: string, index: number, number: string) {
  update((d) => {
    const slot = d.rooms[roomId]?.[index]
    if (!slot || slot.used) return

    const nextNumber = number.trim()

    if (nextNumber !== slot.number) {
      slot.number = nextNumber
      slot.vouchers = {
        "VC 35": false,
        "VC 50": false,
        "VC 70": false,
      }
      slot.usesLeft = USES_PER_NUMBER
      slot.used = false
      slot.buyer = ""
      slot.usedAt = null
    }
  })
}

export function clearSlot(roomId: string, index: number) {
  update((d) => {
    if (!d.rooms[roomId]) return
    d.rooms[roomId][index] = emptySlot()
  })
}

/** Pakai 1 voucher. Nomor baru benar-benar habis kalau usesLeft jadi 0. */
export function markUsed(roomId: string, index: number, buyer: string) {
  update((d) => {
    const slot = d.rooms[roomId]?.[index]
    if (!slot || !slot.number || slot.usesLeft <= 0) return
    const at = Date.now()
    const useNo = USES_PER_NUMBER - slot.usesLeft + 1
    slot.usesLeft -= 1
    slot.used = slot.usesLeft === 0
    slot.buyer = buyer.trim()
    slot.usedAt = at
    d.history.unshift({
      id: `${at}-${roomId}-${index}-${useNo}`,
      roomId,
      roomName: roomName(roomId),
      slot: index + 1,
      number: slot.number,
      buyer: slot.buyer,
      at,
      useNo,
      usesLeft: slot.usesLeft,
    })
  })
}
export function toggleVoucher(
  roomId: string,
  index: number,
  voucherType: VoucherType,
) {
  update((d) => {
    const slot = d.rooms[roomId]?.[index]

    if (!slot || !slot.number) return

    const currentlyChecked = slot.vouchers[voucherType]

    slot.vouchers[voucherType] = !currentlyChecked

    slot.usesLeft = VOUCHER_TYPES.filter(
      (type) => !slot.vouchers[type],
    ).length

    slot.used = slot.usesLeft === 0
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
        slot.usesLeft = USES_PER_NUMBER
        slot.buyer = ""
        slot.usedAt = null
        i++
      }
    }
  })
}

/** Resets the room back to 3 empty slots. PIN dan riwayat tetap. */
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

/** Jumlah nomor yang sudah habis 3x pakai. */
export function usedCount(slots: Slot[]) {
  return slots.filter((s) => s.used).length
}

/** Nomor yang masih punya sisa voucher. */
export function unusedNumbers(slots: Slot[]) {
  return slots.filter((s) => !s.used && s.number).map((s) => s.number)
}

/** Total sisa voucher di satu room. */
export function remainingUses(slots: Slot[]) {
  return slots.reduce((n, s) => (s.number ? n + s.usesLeft : n), 0)
}

export function isRoomFinished(slots: Slot[]) {
  return slots.length > 0 && slots.every((s) => Boolean(s.number) && s.usesLeft === 0)
}

/** Label sisa voucher untuk satu slot. */
export function usesLabel(slot: Slot) {
  if (!slot.number) return "Slot kosong"
  if (slot.usesLeft === 0) return "Habis terpakai"
  if (slot.usesLeft === USES_PER_NUMBER) return `${USES_PER_NUMBER}x pakai`
  return `${slot.usesLeft}x pakai tersisa`
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
