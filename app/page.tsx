"use client"

import Link from "next/link"
import { ChevronRight, Coffee, Copy, Sparkles } from "lucide-react"
import { AppHeader, Card, PinBadge, useToast } from "@/components/app-ui"
import { Button } from "@/components/ui/button"
import {
  ROOMS,
  USES_PER_NUMBER,
  copyText,
  remainingUses,
  roomPin,
  unusedNumbers,
  useAppData,
  usedCount,
} from "@/lib/store"

export default function HomePage() {
  const data = useAppData()
  const { toast, ToastView } = useToast()

  if (!data) {
    return (
      <AppHeader
        title="Jasdor by Esaashop"
        subtitle="Memuat data..."
      />
    )
  }

  const allUnused = ROOMS.flatMap((room) =>
    unusedNumbers(data.rooms[room.id]),
  )

  const totalUsed = ROOMS.reduce(
    (total, room) => total + usedCount(data.rooms[room.id]),
    0,
  )

  const totalVouchers = ROOMS.reduce(
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
    <main className="relative min-h-screen overflow-hidden">
      {/* BACKGROUND */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/jasdor-bg.jpg')",
        }}
      />

      {/* OVERLAY */}
      <div className="fixed inset-0 -z-10 bg-[#fff7f2]/35" />

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

          {/* ROOM TITLE */}
          <div className="px-1 pt-1">
            <p className="font-serif text-xl font-bold text-[#5d3d2b]">
              📱 Room Jasdor
            </p>

            <p className="mt-0.5 text-xs text-[#927463]">
              Maksimal 3 nomor setiap room
            </p>
          </div>

          {/* ROOMS */}
          <ul className="space-y-3">
            {ROOMS.map((room) => {
              const slots = data.rooms[room.id]
              const used = usedCount(slots)
              const done = used === slots.length
              const remaining = remainingUses(slots)

              return (
                <li key={room.id}>
                  <Link href={`/room/${room.id}`} className="block">
                    <Card className="border-white/80 bg-white/85 shadow-lg backdrop-blur">
                      <div className="flex items-center gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3ded2] text-xl">
                          {done ? "☕" : "📱"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-serif text-lg font-bold text-[#5d3d2b]">
                              {room.name}
                            </p>

                            <p className="font-serif text-xl font-bold text-[#5d3d2b]">
                              {used}/{slots.length}
                            </p>
                          </div>

                          <div className="mt-1">
                            <PinBadge
                              pin={roomPin(data, room.id)}
                              className="border-[#ead6ca] bg-[#fff7f2] text-[#79563f]"
                            />
                          </div>

                          <div className="mt-2 flex gap-1.5">
                            {slots.map((slot, index) => (
                              <span
                                key={index}
                                className="flex h-2 flex-1 gap-0.5 overflow-hidden rounded-full bg-[#eadbd3]"
                              >
                                {Array.from(
                                  { length: USES_PER_NUMBER },
                                  (_, useIndex) => (
                                    <span
                                      key={useIndex}
                                      className={
                                        "flex-1 rounded-full " +
                                        (slot.number &&
                                        useIndex < slot.usesLeft
                                          ? "bg-[#b87856]"
                                          : "bg-[#efd7ca]")
                                      }
                                    />
                                  ),
                                )}
                              </span>
                            ))}
                          </div>

                          <p className="mt-1.5 text-[11px] text-[#927463]">
                            {done
                              ? "☕ Room selesai"
                              : `${remaining} voucher tersisa`}
                          </p>
                        </div>

                        <ChevronRight className="size-5 shrink-0 text-[#b28b75]" />
                      </div>
                    </Card>
                  </Link>
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
