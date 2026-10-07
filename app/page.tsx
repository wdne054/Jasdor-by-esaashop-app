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
      className="min-w-[180px] flex-1 rounded-xl border border-[#e8d7cb] bg-white px-3 py-2 text-sm outline-none"
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
      className="relative min-h-screen overflow-hidden bg-cover bg-center bg-fixed text-[#6b4a36]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,247,242,0.48), rgba(255,247,242,0.48)), url('/jasdor-bg.jpg')",
      }}
    >
      <div className="mx-auto min-h-screen max-w-md">

        {/* HEADER */}

        <header className="px-5 pb-5 pt-8">
          <div className="flex items-center gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/90 shadow-lg backdrop-blur">
              <Coffee className="size-7 text-[#8b5e3c]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a8785a]">
                coffee time ☕
              </p>

              <h1 className="font-serif text-[26px] font-bold tracking-tight text-[#5d3d2b]">
                Jasdor by Esaashop
              </h1>

              <p className="text-sm font-medium text-[#927463]">
                Semangat jasdor hari ini 🤎
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-4 px-4 pb-10">

          {/* SUMMARY */}

          <Card className="border-white/80 bg-white/88 shadow-lg backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-[20px] bg-[#f3ded2]">
                <Sparkles className="size-6 text-[#9b6949]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-[#a8785a]">
                  Siap jasdor
                </p>

                <p className="font-serif text-[26px] font-bold tracking-tight text-[#5d3d2b]">
                  {totalVouchers} voucher
                </p>

                <p className="text-xs text-[#927463]">
                  {allUnused.length} nomor aktif ·{" "}
                  {totalUsed} nomor habis
                </p>
              </div>

              <Button
                onClick={copyAll}
                className="h-11 rounded-full bg-[#8b5e3c] px-4 text-xs font-bold text-white shadow-sm"
              >
                <Copy className="size-4" />
                Copy
              </Button>
            </div>
          </Card>

{/* DATA BACKUP */}

<Card className="border-white/80 bg-white/88 shadow-lg backdrop-blur">
  <div className="flex items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wide text-[#a8785a]">
        Data
      </p>

      <p className="font-serif text-lg font-bold text-[#5d3d2b]">
        Backup & Migrasi
      </p>

      <p className="text-xs text-[#927463]">
        Simpan atau pindahkan data Jasdor
      </p>
    </div>

    <div className="flex shrink-0 gap-2">
      <Button
        type="button"
        onClick={exportBackup}
        className="h-10 rounded-xl bg-[#8b5e3c] px-3 text-xs font-bold text-white"
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

        <span className="flex h-10 items-center rounded-xl border border-[#8b5e3c] bg-white px-3 text-xs font-bold text-[#8b5e3c]">
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
            <Card className="flex items-center gap-3 border-white/80 bg-white/85 shadow-lg backdrop-blur">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#c98767] text-white shadow-sm">
                <Coffee className="size-6" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-serif text-xl font-bold text-[#5d3d2b]">
                    BAPERAN
                  </p>

                  <span className="rounded-full bg-[#f1d2c3] px-2 py-0.5 text-[10px] font-bold text-[#80563e]">
                    EXTRA
                  </span>
                </div>

                <p className="mt-1 text-xs text-[#927463]">
                  Unlimited nomor · 1x pakai · PIN masing-masing
                </p>
              </div>

              <ChevronRight className="size-5 text-[#a8785a]" />
            </Card>
          </Link>

          {/* ROOM TITLE */}

          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-[#6f4932]">
              📱 ROOMS
            </h2>

            <Button
              type="button"
              onClick={addRoom}
              className="h-10 rounded-full bg-[#8b5e3c] px-4 text-xs font-bold text-white shadow-sm"
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
                  <Card className="border-white/80 bg-white/88 shadow-lg backdrop-blur">

                    <div className="mb-3 flex items-center justify-between gap-2">

                      <div className="min-w-0">
                        <p className="font-serif text-lg font-bold text-[#5d3d2b]">
                          {room.name}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <PinBadge
                            pin={roomPin(
                              data,
                              room.id,
                            )}
                            className="border-[#ead6ca] bg-[#fff7f2] text-[#79563f]"
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
                            className="h-9 rounded-full border-[#e8d7cb] bg-white/70 px-3 text-xs font-bold"
                          >
                            Edit PIN
                          </Button>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <p className="text-xs font-bold text-[#927463]">
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
                          className="h-10 rounded-full border-[#e8d7cb] bg-white/70 px-4 text-xs font-bold text-[#8b5e3c]"
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
                            className="rounded-[26px] border border-[#eadbd3] bg-[#fffaf7]/95 p-3 shadow-sm"
                          >
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-[#8b6b57]">
                                NOMOR{" "}
                                {index + 1}
                              </span>

                              <span className="text-[11px] font-bold text-[#927463]">
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
                                  className="h-10 rounded-full border-[#e8d7cb] bg-white/75 px-4 text-xs font-bold"
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
                                    className="h-10 rounded-full border-[#e8d7cb] bg-white/75 px-4 text-xs font-bold"
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
                                  className="h-10 rounded-full border-[#e8d7cb] bg-white/75 px-4 text-xs"
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
                                        "flex min-h-10 items-center justify-center gap-1 rounded-full border px-2 text-xs font-bold transition " +
                                        (checked
                                          ? "border-[#8b5e3c] bg-[#8b5e3c] text-white shadow-sm"
                                          : "border-[#eadbd3] bg-white/80 text-[#8b6b57]")
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

          <p className="pt-2 text-center text-[11px] text-[#a1816f]">
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
