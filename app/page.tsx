"use client"

import Link from "next/link"
import {
  useEffect,
  useRef,
  useState,
} from "react"
import {
  ChevronRight,
  Coffee,
  Copy,
  Sparkles,
} from "lucide-react"

import {
  AppHeader,
  Card,
  PinBadge,
  useToast,
} from "@/components/app-ui"

import { Button } from "@/components/ui/button"

import {
  USES_PER_NUMBER,
  VOUCHER_TYPES,
  addRoom,
  removeRoom,
  clearSlot,
  copyText,
  exportBackup,
  importBackup,
  getRooms,
  remainingUses,
  roomPin,
  setRoomPin,
  setSlotNumber,
  adjustDailyFinance,
  setDailyFinance,
  toggleVoucher,
  unusedNumbers,
  useAppData,
  usedCount,
} from "@/lib/store"

/* =========================================================
   INPUT NOMOR ROOM
   ========================================================= */

type RoomNumberInputProps = {
  value: string
  disabled: boolean
  onSave: (value: string) => void
}

function RoomNumberInput({
  value,
  disabled,
  onSave,
}: RoomNumberInputProps) {
  const [draft, setDraft] =
    useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  function save() {
    const clean = draft.trim()

    if (clean !== value) {
      onSave(clean)
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={draft}
      onChange={(event) =>
        setDraft(event.target.value)
      }
      onBlur={save}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur()
        }
      }}
      placeholder="Masukkan nomor OTP"
      disabled={disabled}
      className="min-w-[180px] flex-1 rounded-2xl border border-[#e4cbd4] bg-[#fffafd] px-3 py-2 text-sm font-medium outline-none focus:border-[#b85f7d]"
    />
  )
}


        
/* =========================================================
   HOME
   ========================================================= */

export default function HomePage() {
  const data = useAppData()
  const { toast, ToastView } =
    useToast()

    const fileInputRef =
    useRef<HTMLInputElement>(null)

  async function handleImport(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0]

    if (!file) return

    const ok =
      await importBackup(file)

    toast(
      ok
        ? "Backup berhasil dipulihkan ☕"
        : "File backup tidak valid",
    )

    event.target.value = ""
  }

  if (!data) {
    return (
      <AppHeader
        title="Jasdor by Esaashop"
        subtitle="Memuat data..."
      />
    )
  }

  const rooms = getRooms(data)

  const allUnused = rooms.flatMap(
    (room) =>
      unusedNumbers(
        data.rooms[room.id],
      ),
  )

  const totalUsed =
    rooms.reduce(
      (total, room) =>
        total +
        usedCount(
          data.rooms[room.id],
        ),
      0,
    )

  const totalVouchers =
    rooms.reduce(
      (total, room) =>
        total +
        remainingUses(
          data.rooms[room.id],
        ),
      0,
    )

  async function copyAll() {
    if (allUnused.length === 0) {
      toast(
        "Tidak ada nomor tersisa",
      )

      return
    }

    const ok =
      await copyText(
        allUnused.join("\n"),
      )

    toast(
      ok
        ? `${allUnused.length} nomor dicopy ☕`
        : "Gagal copy",
    )
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-cover bg-center bg-fixed text-[#593b49]"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(255,244,247,0.90), rgba(255,250,242,0.86)), url('/jasdor-bg.jpg')",
      }}
    >
      <div className="mx-auto min-h-screen max-w-md">
        <div className="pointer-events-none absolute right-3 top-3 text-2xl opacity-70">🎀</div>
        <div className="pointer-events-none absolute left-3 top-28 text-lg opacity-60">✦</div>

        {/* HEADER */}

        <header className="px-4 pb-4 pt-5">
          <div className="rounded-[28px] border border-white/80 bg-[#fff9f6]/96 p-3 shadow-[0_12px_35px_rgba(124,76,91,0.12)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-[20px] border border-[#f4d9df] bg-[#ffeef2] shadow-sm">
              <Coffee className="size-7 text-[#b85f7d]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#b85f7d]">
                coffee time ☕
              </p>

              <h1 className="font-sans text-[26px] font-extrabold tracking-tight text-[#583746]">
                Jasdor by Esaashop
              </h1>

              <p className="text-sm font-medium text-[#765765]">
                Semangat jasdor hari ini 🤎
              </p>
            </div>
          </div>
        </div>
        </header>

        <div className="space-y-4 px-4 pb-10">

          {/* SUMMARY */}

          <Card className="border-white/85 bg-[#fffaf9]/97 shadow-[0_10px_28px_rgba(124,76,91,0.10)] backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-[18px] bg-[#fce2e9]">
                <Sparkles className="size-6 text-[#b85f7d]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#b85f7d]">
                  Siap jasdor
                </p>

                <p className="font-sans text-2xl font-extrabold text-[#583746]">
                  {totalVouchers} voucher
                </p>

                <p className="text-xs text-[#765a48]">
                  {allUnused.length} nomor aktif ·{" "}
                  {totalUsed} nomor habis
                </p>
              </div>

              <Button
                onClick={copyAll}
                className="h-11 rounded-2xl bg-[#b85f7d] px-4 text-xs font-extrabold text-white shadow-sm"
              >
                <Copy className="size-4" />
                Copy
              </Button>
            </div>
          </Card>

{/* DATA BACKUP */}

<Card className="border-white/80 bg-[#fffdfb]/96 shadow-lg backdrop-blur">
  <div className="flex items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wide text-[#8e5d40]">
        Data
      </p>

      <p className="font-sans text-lg font-bold text-[#5a3828]">
        Backup & Migrasi
      </p>

      <p className="text-xs text-[#765a48]">
        Simpan atau pindahkan data Jasdor
      </p>
    </div>

    <div className="flex shrink-0 gap-2">
      <Button
        type="button"
        onClick={exportBackup}
        className="h-10 rounded-2xl bg-[#b85f7d] px-3 text-xs font-extrabold text-white shadow-sm"
      >
        Backup
      </Button>

      <label className="cursor-pointer">
        <input
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]

            if (!file) {
              return
            }

            importBackup(file)

            event.currentTarget.value = ""
          }}
        />

        <span className="flex h-10 items-center rounded-2xl border border-[#d79aaa] bg-[#fffafd] px-3 text-xs font-extrabold text-[#9d4f6b]">
          Import
        </span>
      </label>
    </div>
  </div>
</Card>
          {/* BAPERAN */}

          <Link
            href="/baperan"
            className="block"
          >
            <Card className="flex items-center gap-3 border-white/80 bg-[#fffdfc]/96 shadow-lg backdrop-blur">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-[18px] bg-[#c96f89] text-white shadow-sm">
                <Coffee className="size-6" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-sans text-xl font-extrabold text-[#583746]">
                    BAPERAN
                  </p>

                  <span className="rounded-full bg-[#f3cad7] px-2 py-0.5 text-[10px] font-extrabold text-[#974c68]">
                    EXTRA
                  </span>
                </div>

                <p className="mt-1 text-xs text-[#765a48]">
                  Unlimited nomor · 1x pakai · PIN masing-masing
                </p>
              </div>

              <ChevronRight className="size-5 text-[#b85f7d]" />
            </Card>
          </Link>

          {/* ROOM TITLE */}

          <div className="mb-3 flex items-center justify-between rounded-2xl bg-[#fff7fa]/80 px-3 py-2">
            <h2 className="text-lg font-extrabold text-[#583746]">
              📱 ROOMS
            </h2>

            <Button
              type="button"
              onClick={addRoom}
              className="h-9 rounded-2xl bg-[#b85f7d] px-3 text-xs font-extrabold text-white shadow-sm"
            >
              + Tambah ROOM
            </Button>
          </div>

          {/* ROOMS */}

          <ul className="space-y-3">
            {rooms.map((room) => {
              const slots =
                data.rooms[room.id]

              const remaining =
                remainingUses(
                  slots,
                )

              return (
                <li
                  key={room.id}
                >
                  <Card className="border-white/80 bg-[#fffdfc]/96 shadow-lg backdrop-blur">

                    <div className="mb-3 flex items-center justify-between gap-2">

                      <div className="min-w-0">
                        <p className="font-sans text-lg font-bold text-[#5a3828]">
                          {room.name}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <PinBadge
                            pin={roomPin(
                              data,
                              room.id,
                            )}
                            className="border-[#dfc7b9] bg-[#fff7f2] text-[#76503a]"
                          />

                          <Button
                            type="button"
                            onClick={() => {
                              const next =
                                window.prompt(
                                  `PIN ${room.name}`,
                                  roomPin(
                                    data,
                                    room.id,
                                  ),
                                )

                              if (
                                next !== null
                              ) {
                                setRoomPin(
                                  room.id,
                                  next,
                                )

                                toast(
                                  `PIN ${room.name} berhasil disimpan`,
                                )
                              }
                            }}
                            variant="outline"
                            className="h-7 rounded-lg border-[#dfc7b9] px-2 text-[11px] font-bold"
                          >
                            Edit PIN
                          </Button>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <p className="text-xs font-bold text-[#765a48]">
                          {remaining} voucher
                        </p>

                        <Button
                          type="button"
                          onClick={() => {
                            const yakin =
                              window.confirm(
                                `Hapus ${room.name}? Semua nomor di ROOM ini akan ikut terhapus.`,
                              )

                            if (yakin) {
                              removeRoom(
                                room.id,
                              )

                              toast(
                                `${room.name} berhasil dihapus`,
                              )
                            }
                          }}
                          variant="outline"
                          className="h-9 rounded-xl border-[#dfc7b9] px-3 text-xs font-bold text-[#92533e]"
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {slots.map(
                        (
                          slot,
                          index,
                        ) => (
                          <div
                            key={index}
                            className="rounded-[22px] border border-[#e5cbd4] bg-[#fffdfc]/95 p-3 shadow-sm"
                          >
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span className="text-xs font-extrabold text-[#835565]">
                                NOMOR{" "}
                                {index + 1}
                              </span>

                              <span className="text-[11px] font-bold text-[#765a48]">
                                {slot.number
                                  ? `${slot.usesLeft}/${USES_PER_NUMBER} voucher`
                                  : "Belum diisi"}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">

                              <RoomNumberInput
                                value={
                                  slot.number
                                }
                                disabled={
                                  slot.used
                                }
                                onSave={(
                                  value,
                                ) =>
                                  setSlotNumber(
                                    room.id,
                                    index,
                                    value,
                                  )
                                }
                              />

                              {slot.number && (
                                <Button
                                  type="button"
                                  onClick={async () => {
                                    const ok =
                                      await copyText(
                                        slot.number,
                                      )

                                    toast(
                                      ok
                                        ? "Nomor berhasil dicopy ☕"
                                        : "Gagal copy",
                                    )
                                  }}
                                  variant="outline"
                                  className="h-10 rounded-xl border-[#dfc7b9] px-3 text-xs font-bold"
                                >
                                  <Copy className="mr-1 h-4 w-4" />
                                  Copy
                                </Button>
                              )}

                              {slot.number &&
                                !slot.used && (
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      const next =
                                        window.prompt(
                                          "Edit nomor OTP",
                                          slot.number,
                                        )

                                      if (
                                        next !==
                                        null
                                      ) {
                                        setSlotNumber(
                                          room.id,
                                          index,
                                          next,
                                        )
                                      }
                                    }}
                                    variant="outline"
                                    className="h-10 rounded-xl border-[#dfc7b9] px-3 text-xs font-bold"
                                  >
                                    Edit
                                  </Button>
                                )}

                              {slot.number && (
                                <Button
                                  type="button"
                                  onClick={() =>
                                    clearSlot(
                                      room.id,
                                      index,
                                    )
                                  }
                                  variant="outline"
                                  className="h-10 rounded-xl border-[#dfc7b9] px-3 text-xs"
                                >
                                  Hapus
                                </Button>
                              )}
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-2">
                              {VOUCHER_TYPES.map(
                                (
                                  voucherType,
                                ) => {
                                  const checked =
                                    Boolean(
                                      slot
                                        .vouchers?.[
                                        voucherType
                                      ],
                                    )

                                  return (
                                    <button
                                      key={
                                        voucherType
                                      }
                                      type="button"
                                      onClick={() =>
                                        toggleVoucher(
                                          room.id,
                                          index,
                                          voucherType,
                                        )
                                      }
                                      disabled={
                                        !slot.number
                                      }
                                      className={
                                        "flex min-h-10 items-center justify-center gap-1 rounded-xl border px-2 text-xs font-bold transition " +
                                        (checked
                                          ? "border-[#b85f7d] bg-[#b85f7d] text-white"
                                          : "border-[#e5cbd4] bg-white text-[#8f6574]")
                                      }
                                    >
                                      <span className="text-sm">
                                        {checked
                                          ? "☑"
                                          : "☐"}
                                      </span>

                                      {
                                        voucherType
                                      }
                                    </button>
                                  )
                                },
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>

          <p className="pt-3 text-center text-[11px] font-medium text-[#80606c]">
            ☕ Jasdor by Esaashop · semangat cari cuan 🤎
          </p>
        </div>
      </div>

      {ToastView}
    </main>
  )
}

/* =========================================================
   LOCAL DATE
   ========================================================= */

function getLocalDateKey(
  date = new Date(),
) {
  const year =
    date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0")

  const day = String(
    date.getDate(),
  ).padStart(2, "0")

  return `${year}-${month}-${day}`
      }
