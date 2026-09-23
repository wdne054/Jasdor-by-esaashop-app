"use client"

import Link from "next/link"
import { ChevronRight, Coffee, Copy, Sparkles } from "lucide-react"
import { AppHeader, Card, PinBadge, useToast } from "@/components/app-ui"
import { Button } from "@/components/ui/button"
import {
  USES_PER_NUMBER,
  VOUCHER_TYPES,
  addRoom,
  removeRoom,
  clearSlot,
  copyText,
  getRooms,
  markUsed,
  remainingUses,
  roomPin,
  setRoomPin,
  setSlotNumber,
  setFinance,
  toggleVoucher,
  unusedNumbers,
  useAppData,
  usedCount,
} from "@/lib/store"

export default function HomePage() {
  const data = useAppData()
  const { toast, ToastView } = useToast()
const finance = data?.finance

  const netProfit = finance
    ? finance.income -
      finance.otpCost -
      finance.roomCost -
      finance.expenses
    : 0

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID").format(value)
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

const allUnused = rooms.flatMap((room) =>
  unusedNumbers(data.rooms[room.id]),
)

const totalUsed = rooms.reduce(
  (total, room) => total + usedCount(data.rooms[room.id]),
  0,
)

const totalVouchers = rooms.reduce(
  (total, room) => total + remainingUses(data.rooms[room.id]),
  0,
)

  async function copyAll() {
    if (allUnused.length === 0) {
      toast("Tidak ada nomor tersisa")
      return
    }

    const ok = await copyText(allUnused.join("\n"))

    toast(ok ? `${allUnused.length} nomor dicopy ☕` : "Gagal copy")
  }

  return (
<main
  className="relative min-h-screen overflow-hidden bg-cover bg-center bg-fixed"
  style={{
    backgroundImage:
      "linear-gradient(rgba(255,247,242,0.35), rgba(255,247,242,0.35)), url('/jasdor-bg.jpg')",
  }}
>

      <div className="mx-auto min-h-screen max-w-md">
        {/* HEADER */}
        <header className="px-5 pb-4 pt-7">
          <div className="flex items-center gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/80 shadow-lg backdrop-blur">
              <Coffee className="size-7 text-[#8b5e3c]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a8785a]">
                coffee time ☕
              </p>

              <h1 className="font-serif text-2xl font-bold text-[#5d3d2b]">
                Jasdor by Esaashop
              </h1>

              <p className="text-sm text-[#927463]">
                Semangat jasdor hari ini 🤎
              </p>
              <Button
  onClick={() => removeRoom(room.id)}
  variant="outline"
  className="h-8 rounded-lg border-[#e8d7cb] px-2 text-[11px] font-bold text-[#9a6b55]"
>
  Hapus
</Button>
            </div>
          </div>
        </header>

        <div className="space-y-4 px-4 pb-10">
          {/* SUMMARY */}
          <Card className="border-white/80 bg-white/80 shadow-lg backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3ded2]">
                <Sparkles className="size-6 text-[#9b6949]" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-[#a8785a]">
                  Siap jasdor
                </p>

                <p className="font-serif text-2xl font-bold text-[#5d3d2b]">
                  {totalVouchers} voucher
                </p>

                <p className="text-xs text-[#927463]">
                  {allUnused.length} nomor aktif · {totalUsed} nomor habis
                </p>
              </div>

              <Button
                onClick={copyAll}
                className="h-11 rounded-xl bg-[#8b5e3c] px-3 text-xs font-bold text-white"
              >
                <Copy className="size-4" />
                Copy
              </Button>
            </div>
          </Card>

          {/* BAPERAN */}
          <Link href="/baperan" className="block">
            <Card className="flex items-center gap-3 border-white/80 bg-white/85 shadow-lg backdrop-blur">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#c98767] text-white">
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
{/* KEUANGAN */}
<Card className="border-white/80 bg-white/85 shadow-lg backdrop-blur">
  <div className="mb-4">
    <h2 className="text-lg font-bold text-[#6f4932]">
      💰 Keuangan
    </h2>
    <p className="text-xs text-[#8b6b57]">
      Catat pemasukan dan pengeluaran
    </p>
  </div>

  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="mb-1 block text-xs font-medium text-[#765542]">
        Total Pemasukan
      </label>
      <input
        type="number"
        min="0"
        value={finance?.income || ""}
        onChange={(e) => setFinance("income", Number(e.target.value))}
        placeholder="0"
        className="w-full rounded-xl border border-[#e8d7cb] bg-white px-3 py-2 text-sm outline-none"
      />
    </div>

    <div>
      <label className="mb-1 block text-xs font-medium text-[#765542]">
        Modal OTP
      </label>
      <input
        type="number"
        min="0"
        value={finance?.otpCost || ""}
        onChange={(e) => setFinance("otpCost", Number(e.target.value))}
        placeholder="0"
        className="w-full rounded-xl border border-[#e8d7cb] bg-white px-3 py-2 text-sm outline-none"
      />
    </div>

    <div>
      <label className="mb-1 block text-xs font-medium text-[#765542]">
        Modal ROOM
      </label>
      <input
        type="number"
        min="0"
        value={finance?.otpCost || ""}
        onChange={(e) => setFinance("roomCost", Number(e.target.value))}
        placeholder="0"
        className="w-full rounded-xl border border-[#e8d7cb] bg-white px-3 py-2 text-sm outline-none"
      />
    </div>

    <div>
      <label className="mb-1 block text-xs font-medium text-[#765542]">
        Pengeluaran
      </label>
      <input
        type="number"
        min="0"
        value={finance?.expenses || ""}
        onChange={(e) => setFinance("expenses", Number(e.target.value))}
        placeholder="0"
        className="w-full rounded-xl border border-[#e8d7cb] bg-white px-3 py-2 text-sm outline-none"
      />
    </div>
  </div>

  <div className="mt-4 rounded-2xl bg-[#f8eee7] p-4 text-center">
    <p className="text-xs font-medium text-[#8b6b57]">
      UNTUNG BERSIH
    </p>
    <p className="mt-1 text-2xl font-bold text-[#6f4932]">
      Rp {formatRupiah(netProfit)}
    </p>
  </div>
</Card>

{/* ROOM TITLE */}
{/* ROOMS */}
<div className="mb-3 flex items-center justify-between">
  <h2 className="text-lg font-bold text-[#6f4932]">
    📱 ROOMS
  </h2>

  <Button
    type="button"
    onClick={addRoom}
    className="h-9 rounded-xl bg-[#8b5e3c] px-3 text-xs font-bold text-white"
  >
    + Tambah ROOM
  </Button>
</div>

<ul className="space-y-3">
  {rooms.map((room) => {
    const slots = data.rooms[room.id]
    const remaining = remainingUses(slots)

    return (
      <li key={room.id}>
        <Card className="border-white/80 bg-white/85 shadow-lg backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-2">
  <div className="min-w-0">
    <p className="font-serif text-lg font-bold text-[#5d3d2b]">
      {room.name}
    </p>

    <div className="mt-1 flex items-center gap-2">
  <PinBadge
    pin={roomPin(data, room.id)}
    className="border-[#ead6ca] bg-[#fff7f2] text-[#79563f]"
  />

  <Button
    type="button"
    onClick={() => {
      const next = window.prompt(
        `PIN ${room.name}`,
        roomPin(data, room.id),
      )

      if (next !== null) {
        setRoomPin(room.id, next)
        toast(`PIN ${room.name} berhasil disimpan`)
      }
    }}
    variant="outline"
    className="h-7 rounded-lg border-[#e8d7cb] px-2 text-[11px] font-bold"
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
        const yakin = window.confirm(
          `Hapus ${room.name}? Semua nomor di ROOM ini akan ikut terhapus.`
        )

        if (yakin) {
          removeRoom(room.id)
          toast(`${room.name} berhasil dihapus`)
        }
      }}
      variant="outline"
      className="h-9 rounded-xl border-[#e8d7cb] px-3 text-xs font-bold text-[#a15f4a]"
    >
      Hapus
    </Button>
  </div>
</div>

          <div className="space-y-2">
            {slots.map((slot, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#eadbd3] bg-[#fffaf7] p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#8b6b57]">
                    NOMOR {index + 1}
                  </span>

                  <span className="text-[11px] font-bold text-[#927463]">
                    {slot.number
                      ? `${slot.usesLeft}/${USES_PER_NUMBER} voucher`
                      : "Belum diisi"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={slot.number}
                    onChange={(e) =>
                      setSlotNumber(room.id, index, e.target.value)
                    }
                    placeholder="Masukkan nomor OTP"
                    disabled={slot.used}
                    className="min-w-[180px] flex-1 rounded-xl border border-[#e8d7cb] bg-white px-3 py-2 text-sm outline-none"
                  />

                  {slot.number && (
                    <Button
                      type="button"
                      onClick={async () => {
                        const ok = await copyText(slot.number)
                        toast(
                          ok
                            ? "Nomor berhasil dicopy ☕"
                            : "Gagal copy",
                        )
                      }}
                      variant="outline"
                      className="h-10 rounded-xl border-[#e8d7cb] px-3 text-xs font-bold"
                    >
                      <Copy className="mr-1 h-4 w-4" />
                      Copy
                    </Button>
                  )}

                  {slot.number && !slot.used && (
                    <Button
                      type="button"
                      onClick={() => {
                        const next = window.prompt(
                          "Edit nomor OTP",
                          slot.number,
                        )

                        if (next !== null) {
                          setSlotNumber(room.id, index, next)
                        }
                      }}
                      variant="outline"
                      className="h-10 rounded-xl border-[#e8d7cb] px-3 text-xs font-bold"
                    >
                      Edit
                    </Button>
                  )}

                  {slot.number && (
                    <Button
                      type="button"
                      onClick={() => clearSlot(room.id, index)}
                      variant="outline"
                      className="h-10 rounded-xl border-[#e8d7cb] px-3 text-xs"
                    >
                      Hapus
                    </Button>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {VOUCHER_TYPES.map((voucherType) => {
                    const checked = Boolean(
                      slot.vouchers?.[voucherType],
                    )

                    return (
                      <button
                        key={voucherType}
                        type="button"
                        onClick={() =>
                          toggleVoucher(
                            room.id,
                            index,
                            voucherType,
                          )
                        }
                        disabled={!slot.number}
                        className={
                          "flex min-h-10 items-center justify-center gap-1 rounded-xl border px-2 text-xs font-bold transition " +
                          (checked
                            ? "border-[#8b5e3c] bg-[#8b5e3c] text-white"
                            : "border-[#eadbd3] bg-white text-[#8b6b57]")
                        }
                      >
                        <span className="text-sm">
                          {checked ? "☑" : "☐"}
                        </span>
                        {voucherType}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
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
