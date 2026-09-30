"use client"

import { useEffect, useState } from "react"

export const ROOMS = [
  { id: "vs1", name: "ROOM 1" },
  { id: "vs2", name: "ROOM 2" },
  { id: "vs3", name: "ROOM 3" },
  { id: "vs4", name: "ROOM 4" },
  { id: "vmos", name: "ROOM 5" },
] as const

// Ini hanya ROOM bawaan saat aplikasi pertama kali dibuat.
// ROOM tambahan tetap bisa dibuat tanpa batas.
export const SLOTS_PER_ROOM = 3
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
  used: boolean
  usesLeft: number
  vouchers: Record<VoucherType, boolean>
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
  voucher: VoucherType
  at: number

  // Dipertahankan supaya data/komponen lama tetap kompatibel.
  useNo?: number
  usesLeft?: number
}

export type DailyFinance = {
  date: string
  income: number
  roomBalance: number
  otpCost: number
  expenses: number
}

export type FinanceData = {
  days: DailyFinance[]
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

  for (const room of ROOMS) {
    pins[room.id] = DEFAULT_PINS[room.id]
  }

  return pins
}

export function initialData(): AppData {
  const rooms: Record<string, Slot[]> = {}
  const roomNames: Record<string, string> = {}

  for (const room of ROOMS) {
    rooms[room.id] = emptyRoom()
    roomNames[room.id] = room.name
  }

  return {
    rooms,
    pins: defaultPins(),
    roomOrder: ROOMS.map((room) => room.id),
    roomNames,
    history: [],
    finance: {
      days: [],
    },
  }
}

function clampUses(n: unknown, fallback: number) {
  const value =
    typeof n === "number" && Number.isFinite(n)
      ? Math.floor(n)
      : fallback

  return Math.min(
    USES_PER_NUMBER,
    Math.max(0, value),
  )
}

function normalizeVoucherState(
  slot: Partial<Slot>,
): Record<VoucherType, boolean> {
  if (slot.vouchers && typeof slot.vouchers === "object") {
    return {
      "VC 35": Boolean(slot.vouchers["VC 35"]),
      "VC 50": Boolean(slot.vouchers["VC 50"]),
      "VC 70": Boolean(slot.vouchers["VC 70"]),
    }
  }

  const oldUsesLeft = clampUses(
    slot.usesLeft,
    slot.used ? 0 : USES_PER_NUMBER,
  )

  return {
    "VC 35": oldUsesLeft <= 2,
    "VC 50": oldUsesLeft <= 1,
    "VC 70": oldUsesLeft <= 0,
  }
}

function normalize(raw: unknown): AppData {
  const data = initialData()

  if (!raw || typeof raw !== "object") {
    return data
  }

  const input = raw as Partial<AppData>

  /*
   * Pertahankan semua ROOM lama.
   * ROOM bawaan selalu dipastikan ada, tetapi ROOM tambahan
   * yang pernah dibuat juga tidak akan hilang.
   */
  const savedOrder = Array.isArray(input.roomOrder)
    ? input.roomOrder.filter(
        (id): id is string =>
          typeof id === "string" && id.trim().length > 0,
      )
    : []

  const savedRooms =
    input.rooms && typeof input.rooms === "object"
      ? Object.keys(input.rooms)
      : []

  const roomOrder: string[] = []

  for (const id of savedOrder) {
    if (!roomOrder.includes(id)) {
      roomOrder.push(id)
    }
  }

  for (const id of savedRooms) {
    if (!roomOrder.includes(id)) {
      roomOrder.push(id)
    }
  }

  for (const room of ROOMS) {
    if (!roomOrder.includes(room.id)) {
      roomOrder.push(room.id)
    }
  }

  data.roomOrder = roomOrder

  const inputRoomNames =
    input.roomNames && typeof input.roomNames === "object"
      ? input.roomNames
      : {}

  data.rooms = {}
  data.pins = {}
  data.roomNames = {}

  for (let index = 0; index < data.roomOrder.length; index++) {
    const roomId = data.roomOrder[index]

    const defaultRoom = ROOMS.find(
      (room) => room.id === roomId,
    )

    const savedName = inputRoomNames[roomId]

    data.roomNames[roomId] =
      typeof savedName === "string" &&
      savedName.trim()
        ? savedName.trim()
        : defaultRoom?.name ?? `ROOM ${index + 1}`

    const savedPin = input.pins?.[roomId]

    if (
      typeof savedPin === "string" &&
      savedPin.trim()
    ) {
      data.pins[roomId] = savedPin
        .trim()
        .slice(0, 12)
    } else {
      data.pins[roomId] =
        defaultRoom
          ? DEFAULT_PINS[roomId] ?? ""
          : ""
    }

    const savedSlots = input.rooms?.[roomId]

    const slots = emptyRoom()

    if (Array.isArray(savedSlots)) {
      for (
        let slotIndex = 0;
        slotIndex < SLOTS_PER_ROOM;
        slotIndex++
      ) {
        const saved = savedSlots[
          slotIndex
        ] as Partial<Slot> | undefined

        if (!saved) continue

        const number =
          typeof saved.number === "string"
            ? saved.number
            : ""

        const vouchers =
          normalizeVoucherState(saved)

        const usesLeft =
          VOUCHER_TYPES.filter(
            (type) => !vouchers[type],
          ).length

        slots[slotIndex] = {
          number,
          used:
            Boolean(number) &&
            usesLeft === 0,
          usesLeft,
          vouchers,
          buyer:
            typeof saved.buyer === "string"
              ? saved.buyer
              : "",
          usedAt:
            typeof saved.usedAt === "number"
              ? saved.usedAt
              : null,
        }
      }
    }

    data.rooms[roomId] = slots
  }

  /*
   * Riwayat.
   * Data lama yang memakai useNo tetap dimigrasikan
   * ke VC 35 / VC 50 / VC 70.
   */
  if (Array.isArray(input.history)) {
    data.history = input.history
      .filter(
        (item): item is HistoryEntry =>
          Boolean(item) &&
          typeof item.number === "string",
      )
      .map((item) => {
        const rawItem = item as HistoryEntry & {
          useNo?: unknown
          usesLeft?: unknown
        }

        let voucher: VoucherType

        if (
          rawItem.voucher === "VC 35" ||
          rawItem.voucher === "VC 50" ||
          rawItem.voucher === "VC 70"
        ) {
          voucher = rawItem.voucher
        } else {
          const useNo =
            typeof rawItem.useNo === "number"
              ? Math.floor(rawItem.useNo)
              : 1

          voucher =
            VOUCHER_TYPES[
              Math.min(
                VOUCHER_TYPES.length - 1,
                Math.max(0, useNo - 1),
              )
            ]
        }

        return {
          id:
            typeof rawItem.id === "string"
              ? rawItem.id
              : `${rawItem.at ?? Date.now()}-${rawItem.number}`,
          roomId:
            typeof rawItem.roomId === "string"
              ? rawItem.roomId
              : "",
          roomName:
            typeof rawItem.roomName === "string"
              ? rawItem.roomName
              : "",
          slot:
            typeof rawItem.slot === "number"
              ? rawItem.slot
              : 0,
          number: rawItem.number,
          buyer:
            typeof rawItem.buyer === "string"
              ? rawItem.buyer
              : "",
          voucher,
          at:
            typeof rawItem.at === "number"
              ? rawItem.at
              : Date.now(),
          useNo:
            typeof rawItem.useNo === "number"
              ? rawItem.useNo
              : VOUCHER_TYPES.indexOf(voucher) + 1,
          usesLeft:
            typeof rawItem.usesLeft === "number"
              ? clampUses(rawItem.usesLeft, 0)
              : undefined,
        }
      })
      .sort((a, b) => b.at - a.at)
  }

  /*
   * Finance tetap kompatibel dengan format lama
   * maupun format days[] yang sekarang.
   */
  const finance = input.finance

  if (finance && typeof finance === "object") {
    const oldFinance = finance as {
      income?: unknown
      otpCost?: unknown
      roomCost?: unknown
      expenses?: unknown
      days?: unknown
    }

    if (Array.isArray(oldFinance.days)) {
      data.finance = {
        days: oldFinance.days
          .filter(
            (day): day is Record<string, unknown> =>
              Boolean(day) &&
              typeof day === "object",
          )
          .map((day) => ({
            date:
              typeof day.date === "string"
                ? day.date
                : getLocalDateKey(),

            income:
              typeof day.income === "number" &&
              Number.isFinite(day.income)
                ? day.income
                : 0,

            roomBalance:
              typeof day.roomBalance === "number" &&
              Number.isFinite(day.roomBalance)
                ? day.roomBalance
                : 0,

            otpCost:
              typeof day.otpCost === "number" &&
              Number.isFinite(day.otpCost)
                ? day.otpCost
                : 0,

            expenses:
              typeof day.expenses === "number" &&
              Number.isFinite(day.expenses)
                ? day.expenses
                : 0,
          })),
      }
    } else {
      data.finance = {
        days: [
          {
            date: getLocalDateKey(),
            income:
              typeof oldFinance.income === "number" &&
              Number.isFinite(oldFinance.income)
                ? oldFinance.income
                : 0,

            roomBalance:
              typeof oldFinance.roomCost === "number" &&
              Number.isFinite(oldFinance.roomCost)
                ? oldFinance.roomCost
                : 0,

            otpCost:
              typeof oldFinance.otpCost === "number" &&
              Number.isFinite(oldFinance.otpCost)
                ? oldFinance.otpCost
                : 0,

            expenses:
              typeof oldFinance.expenses === "number" &&
              Number.isFinite(oldFinance.expenses)
                ? oldFinance.expenses
                : 0,
          },
        ],
      }
    }
  }

  return data
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0")
  const day = String(
    date.getDate(),
  ).padStart(2, "0")

  return `${year}-${month}-${day}`
}

let state: AppData | null = null

const listeners = new Set<() => void>()

function read(): AppData {
  if (state) {
    return state
  }

  if (typeof window === "undefined") {
    return initialData()
  }

  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY,
      )

    state = normalize(
      raw ? JSON.parse(raw) : null,
    )
  } catch {
    state = initialData()
  }

  return state
}

function write(next: AppData) {
  state = next

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next),
    )
  } catch (error) {
    console.log(
      "[jasdor] gagal menyimpan localStorage:",
      error,
    )
  }

  listeners.forEach((listener) => {
    listener()
  })
}
export function exportBackup() {
  const data = read()

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" },
  )

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = `jasdor-backup-${Date.now()}.json`
  link.click()

  URL.revokeObjectURL(url)
  }
function update(
  fn: (draft: AppData) => void,
) {
  /*
   * Tetap gunakan clone agar aksi yang mengubah store
   * tidak merusak state sebelumnya.
   *
   * Input teks TIDAK memanggil update() setiap karakter lagi.
   */
  const next: AppData = JSON.parse(
    JSON.stringify(read()),
  )

  fn(next)
  write(next)
}

export function useAppData(): AppData | null {
  const [data, setData] =
    useState<AppData | null>(null)

  useEffect(() => {
    setData(read())

    const listener = () => {
      setData(read())
    }

    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  }, [])

  return data
}

/* ---------- room helpers ---------- */

export function roomName(roomId: string) {
  return (
    state?.roomNames?.[roomId] ??
    ROOMS.find(
      (room) => room.id === roomId,
    )?.name ??
    roomId
  )
}

export function getRooms(
  data: AppData | null,
): RoomInfo[] {
  if (!data) return []

  return data.roomOrder.map(
    (id, index) => ({
      id,
      name:
        data.roomNames?.[id] ??
        `ROOM ${index + 1}`,
    }),
  )
}

export function roomPin(
  data: AppData | null,
  roomId: string,
) {
  return (
    data?.pins?.[roomId] ??
    DEFAULT_PINS[roomId] ??
    ""
  )
}

export function addRoom() {
  update((data) => {
    let number =
      data.roomOrder.length + 1

    let id = `room-${number}`

    while (data.rooms[id]) {
      number += 1
      id = `room-${number}`
    }

    data.roomOrder.push(id)
    data.roomNames[id] = `ROOM ${number}`
    data.rooms[id] = emptyRoom()
    data.pins[id] = ""
  })
}

export function removeRoom(
  roomId: string,
) {
  update((data) => {
    if (!data.roomOrder.includes(roomId)) {
      return
    }

    data.roomOrder =
      data.roomOrder.filter(
        (id) => id !== roomId,
      )

    delete data.rooms[roomId]
    delete data.pins[roomId]
    delete data.roomNames[roomId]
  })
}

export function setRoomPin(
  roomId: string,
  pin: string,
) {
  update((data) => {
    if (!data.rooms[roomId]) {
      return
    }

    const clean = pin
      .replace(/\s+/g, "")
      .slice(0, 12)

    if (clean) {
      data.pins[roomId] = clean
    } else {
      data.pins[roomId] =
        DEFAULT_PINS[roomId] ?? ""
    }
  })
}

/* ---------- finance ---------- */

export function setDailyFinance(
  date: string,
  field:
    | "income"
    | "roomBalance"
    | "otpCost"
    | "expenses",
  value: number,
) {
  update((data) => {
    let day =
      data.finance.days.find(
        (item) => item.date === date,
      )

    if (!day) {
      day = {
        date,
        income: 0,
        roomBalance: 0,
        otpCost: 0,
        expenses: 0,
      }

      data.finance.days.push(day)
    }

    day[field] =
      Number.isFinite(value) && value >= 0
        ? value
        : 0
  })
}

/* ---------- slot actions ---------- */

export function setSlotNumber(
  roomId: string,
  index: number,
  number: string,
) {
  update((data) => {
    const slot =
      data.rooms[roomId]?.[index]

    if (!slot || slot.used) {
      return
    }

    const nextNumber = number.trim()

    if (nextNumber === slot.number) {
      return
    }

    slot.number = nextNumber

    slot.vouchers = {
      "VC 35": false,
      "VC 50": false,
      "VC 70": false,
    }

    slot.usesLeft =
      USES_PER_NUMBER

    slot.used = false
    slot.buyer = ""
    slot.usedAt = null
  })
}

export function clearSlot(
  roomId: string,
  index: number,
) {
  update((data) => {
    if (!data.rooms[roomId]) {
      return
    }

    data.rooms[roomId][index] =
      emptySlot()
  })
}

/*
 * Dipertahankan supaya kalau ada bagian aplikasi
 * lama yang masih memanggil markUsed(), tetap aman.
 *
 * Sekarang markUsed otomatis mengambil voucher
 * berikutnya yang belum dicentang.
 */
export function markUsed(
  roomId: string,
  index: number,
  buyer: string,
) {
  update((data) => {
    const slot =
      data.rooms[roomId]?.[index]

    if (
      !slot ||
      !slot.number ||
      slot.usesLeft <= 0
    ) {
      return
    }

    const voucher =
      VOUCHER_TYPES.find(
        (type) => !slot.vouchers[type],
      )

    if (!voucher) {
      return
    }

    const at = Date.now()
    const useNo =
      VOUCHER_TYPES.indexOf(voucher) + 1

    slot.vouchers[voucher] = true

    slot.usesLeft =
      VOUCHER_TYPES.filter(
        (type) => !slot.vouchers[type],
      ).length

    slot.used =
      slot.usesLeft === 0

    slot.buyer = buyer.trim()
    slot.usedAt = at

    data.history.unshift({
      id: `${at}-${roomId}-${index}-${useNo}`,
      roomId,
      roomName:
        data.roomNames[roomId] ??
        roomId,
      slot: index + 1,
      number: slot.number,
      buyer: slot.buyer,
      voucher,
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
  update((data) => {
    const slot =
      data.rooms[roomId]?.[index]

    if (!slot || !slot.number) {
      return
    }

    const wasChecked =
      Boolean(
        slot.vouchers[voucherType],
      )

    slot.vouchers[voucherType] =
      !wasChecked

    slot.usesLeft =
      VOUCHER_TYPES.filter(
        (type) => !slot.vouchers[type],
      ).length

    slot.used =
      slot.usesLeft === 0

    if (!wasChecked) {
      const at = Date.now()

      data.history.unshift({
        id: `${at}-${roomId}-${index}-${voucherType}`,
        roomId,
        roomName:
          data.roomNames[roomId] ??
          roomId,
        slot: index + 1,
        number: slot.number,
        buyer: "",
        voucher: voucherType,
        at,
        useNo:
          VOUCHER_TYPES.indexOf(
            voucherType,
          ) + 1,
        usesLeft: slot.usesLeft,
      })
    } else {
      data.history =
        data.history.filter(
          (item) =>
            !(
              item.roomId === roomId &&
              item.slot === index + 1 &&
              item.number ===
                slot.number &&
              item.voucher ===
                voucherType
            ),
        )
    }
  })
}

export function parseNumbers(
  input: string,
): string[] {
  return input
    .split(/[\s,;]+/)
    .map((number) => number.trim())
    .filter(Boolean)
}

export function fillEmptySlots(
  roomId: string,
  numbers: string[],
) {
  update((data) => {
    const slots = data.rooms[roomId]

    if (!slots) {
      return
    }

    let numberIndex = 0

    for (const slot of slots) {
      if (
        numberIndex >=
        numbers.length
      ) {
        break
      }

      if (
        !slot.used &&
        !slot.number
      ) {
        slot.number =
          numbers[numberIndex]

        slot.vouchers = {
          "VC 35": false,
          "VC 50": false,
          "VC 70": false,
        }

        slot.usesLeft =
          USES_PER_NUMBER

        slot.used = false
        slot.buyer = ""
        slot.usedAt = null

        numberIndex++
      }
    }
  })
}

/* ---------- reset ---------- */

export function resetRoom(
  roomId: string,
) {
  update((data) => {
    if (!data.rooms[roomId]) {
      return
    }

    data.rooms[roomId] =
      emptyRoom()
  })
}

export function resetAll() {
  write(initialData())
}

/* ---------- derived helpers ---------- */

export function usedCount(
  slots: Slot[],
) {
  return slots.filter(
    (slot) => slot.used,
  ).length
}

export function unusedNumbers(
  slots: Slot[],
) {
  return slots
    .filter(
      (slot) =>
        !slot.used &&
        Boolean(slot.number),
    )
    .map((slot) => slot.number)
}

export function remainingUses(
  slots: Slot[],
) {
  return slots.reduce(
    (total, slot) =>
      slot.number
        ? total + slot.usesLeft
        : total,
    0,
  )
}

export function isRoomFinished(
  slots: Slot[],
) {
  return (
    slots.length > 0 &&
    slots.every(
      (slot) =>
        Boolean(slot.number) &&
        slot.usesLeft === 0,
    )
  )
}

export function usesLabel(
  slot: Slot,
) {
  if (!slot.number) {
    return "Slot kosong"
  }

  if (slot.usesLeft === 0) {
    return "Habis terpakai"
  }

  if (
    slot.usesLeft ===
    USES_PER_NUMBER
  ) {
    return `${USES_PER_NUMBER}x pakai`
  }

  return `${slot.usesLeft}x pakai tersisa`
}

export function formatTime(
  timestamp: number,
) {
  const date = new Date(timestamp)

  return date.toLocaleString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  )
}

export async function copyText(
  text: string,
) {
  try {
    if (
      navigator.clipboard?.writeText
    ) {
      await navigator.clipboard.writeText(
        text,
      )

      return true
    }
  } catch (error) {
    console.log(
      "[jasdor] clipboard API gagal:",
      error,
    )
  }

  try {
    const textarea =
      document.createElement(
        "textarea",
      )

    textarea.value = text
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"

    document.body.appendChild(
      textarea,
    )

    textarea.select()

    const ok =
      document.execCommand("copy")

    document.body.removeChild(
      textarea,
    )

    return ok
  } catch (error) {
    console.log(
      "[jasdor] clipboard fallback gagal:",
      error,
    )

    return false
  }
}
