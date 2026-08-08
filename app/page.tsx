"use client"

import Link from "next/link"
import { ChevronRight, Copy, Coffee, Sparkles } from "lucide-react"
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
    return <AppHeader title="Jasdor by Esaashop" subtitle="Memuat data…" />
  }

  const allUnused = ROOMS.flatMap((r) => unusedNumbers(data.rooms[r.id]))
  const totalUsed = ROOMS.reduce((n, r) => n + usedCount(data.rooms[r.id]), 0)
  const totalVouchers = ROOMS.reduce(
    (n, r) => n + remainingUses(data.rooms[r.id]),
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
    <main className="relative min-h-screen overflow-x-hidden">
      {/* BACKGROUND FOTO */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url('/jasdor-bg.jpg')" }}
      />

      {/* LAPISAN SUPAYA TULISAN TETAP JELAS */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#fff7f2]/95 via-[#fff5ef]/90 to-[#f8e8df]/96" />

      <div className="mx-auto min-h-screen w-full max-w-md">
        {/* HEADER */}
        <header className="px-5 pb-4 pt-7">
          <div className="flex items-center gap-3">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-[20px] border border-white/70 bg-white/75 shadow-lg backdrop-blur-md">
              <Coffee className="size-7 text-[#8b5e3c]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a8785a]">
                ☕ coffee time
              </p>

              <h1 className="font-serif text-[27px] font-bold leading-tight text-[#5d3d2b]">
                Jasdor by Esaashop
              </h1>

              <p className="mt-0.5 text-sm font-medium text-[#8d6a56]">
                Semangat jasdor hari ini 🤎
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-4 px-4 pb-10">
          {/* RINGKASAN */}
          <Card className="overflow-hidden border-white/70 bg-white/72 shadow-xl shadow-[#7d5138]/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#f5dfd2]">
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
                className="h-11 rounded-xl bg-[#8b5e3c] px-3 text-xs font-bold text-white shadow-md hover:bg-[#754b30]"
              >
                <Copy className="size-4" />
                Copy
              </Button>
            </div>
          </Card>

          {/* BAPERAN */}
          <Link href="/baperan" className="block">
            <Card className="group flex items-center gap-3 border-white/80 bg-gradient-to-r from-[#fffaf7]/90 to-[#f9e8df]/90 shadow-lg shadow-[#7d5138]/10 backdrop-blur-xl transition active:scale-[0.99]">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#c98767] text-white shadow-sm">
                <Coffee className="size-6" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-serif text-xl font-bold text-[#5d3d2b]">
                    BAPERAN
                  </p>
                  <span className="rounded-full bg-[#f1d2c3] px-2 py-0.5 text-[10px] font-bold text-[#80563e]">
                    ☕ EXTRA
                  </span>
                </div>

                <p className="mt-1 text-xs leading-relaxed text-[#927463]">
                  Unlimited nomor · 1x pakai · PIN masing-masing
                </p>
              </div>

              <ChevronRight
                className="size-5 shrink-0 text-[#a8785a] transition group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Card>
          </Link>

          {/* JUDUL ROOM */}
          <div className="px-1 pt-1">
            <p className="font-serif text-xl font-bold text-[#5d3d2b]">
              📱 Room Jasdor
            </p>
            <p className="mt-0.5 text-xs text-[#927463]">
              Maksimal 3 nomor setiap room
            </p>
          </div>

          {/* ROOM */}
          <ul className="space-y-3">
            {ROOMS.map((room) => {
              const slots = data.rooms[room.id]
              const used = usedCount(slots)
              const done = used === slots.length

              return (
                <li key={room.id}>
                  <Link href={`/room/${room.id}`} className="block">
                    <Card
                      className={
                        "group flex items-center gap-3 border-white/80 bg-white/78 shadow-lg shadow-[#7d5138]/10 backdrop-blur-xl transition active:scale-[0.99] " +
                        (done ? "opacity-90" : "")
                      }
                    >
                      {/* ICON */}
                      <div
                        className={
                          "flex size-12 shrink-0 items-center justify-center rounded-2xl text-xl " +
                          (done
                            ? "bg-[#eadbd3]"
                            : "bg-[#f3ded2]")
                        }
                      >
                        {done ? "☕" : "📱"}
                      </div>

                      {/* INFO */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-serif text-lg font-bold text-[#5d3d2b]">
                            {room.name}
                          </p>

                          <p
                            className={
                              "font-serif text-xl font-bold " +
                              (done
                                ? "text-[#9b6949]"
                                : "text-[#5d3d2b]")
                            }
                          >
                            {used}/{slots.length}
                          </p>
                        </div>

                        <div className="mt-1">
                          <PinBadge
                            pin={roomPin(data, room.id)}
                            className="border-[#ead6ca] bg-[#fff7f2] text-[#79563f]"
                          />
                        </div>

                        {/* PROGRESS */}
                        <div
                          className="mt-2.5 flex gap-1.5"
                          aria-hidden="true"
                        >
                          {slots.map((s, i) => (
                            <span
                              key={i}
                              className="flex h-2 flex-1 gap-0.5 overflow-hidden rounded-full bg-[#eadbd3]"
                            >
                              {Array.from(
                                { length: USES_PER_NUMBER },
                                (_, u) => (
                                  <span
                                    key={u}
                                    className={
                                      "flex-1 rounded-full " +
                                      (!s.number
                                        ? "bg-[#eadbd3]"
                                        : u < s.usesLeft
                                          ? "bg-[#b87856]"
                                          : "bg-[#efd7ca]")
                                    }
                                  />
                                ),
                              )}
                            </span>
                          ))}
                        </div>

                        <p className="mt-1.5 text-[11px] font-medium text-[#927463]">
                          {done
                            ? "☕ Room selesai"
                            : `${remainingUses(slots)} voucher tersisa`}
                        </p>
                      </div>

                      <ChevronRight
                        className="size-5 shrink-0 text-[#b28b75] transition group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Card>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* FOOTER */}
          <div className="pt-2 text-center">
            <p className="text-[11px] font-medium text-[#a1816f]">
              ☕ Jasdor by Esaashop · semangat cari cuan 🤎
            </p>
          </div>
        </div>
      </div>

      {ToastView}
    </main>
  )
                }                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-lg leading-tight font-bold">{room.name}</p>
                      <div className="mt-1.5">
                        <PinBadge pin={roomPin(data, room.id)} />
                      </div>
                      <div className="mt-2 flex gap-1.5" aria-hidden="true">
                        {slots.map((s, i) => (
                          <span key={i} className="bg-muted flex h-2.5 flex-1 gap-px overflow-hidden rounded-full">
                            {Array.from({ length: USES_PER_NUMBER }, (_, u) => (
                              <span
                                key={u}
                                className={
                                  "flex-1 " +
                                  (!s.number
                                    ? "bg-muted"
                                    : u < s.usesLeft
                                      ? "bg-primary"
                                      : "bg-accent/50")
                                }
                              />
                            ))}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={
                          "font-serif text-xl font-bold " + (done ? "text-primary" : "text-foreground")
                        }
                      >
                        {used}/{slots.length}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {done ? "Selesai" : `${remainingUses(slots)} voucher`}
                      </p>
                    </div>
                    <ChevronRight className="text-muted-foreground size-5" aria-hidden="true" />
                  </Card>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
      {ToastView}
    </main>
  )
}
