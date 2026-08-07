"use client"

import Link from "next/link"
import { ChevronRight, Copy } from "lucide-react"
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
  const totalVouchers = ROOMS.reduce((n, r) => n + remainingUses(data.rooms[r.id]), 0)

  async function copyAll() {
    if (allUnused.length === 0) {
      toast("Tidak ada nomor tersisa")
      return
    }
    const ok = await copyText(allUnused.join("\n"))
    toast(ok ? `${allUnused.length} nomor dicopy` : "Gagal copy")
  }

  return (
    <main>
      <AppHeader
        title="Jasdor by Esaashop"
        subtitle={`5 room · 3 nomor · ${USES_PER_NUMBER}x pakai per nomor`}
      />

      <div className="space-y-3 px-4">
        <Card className="bg-secondary flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold">Sisa voucher siap pakai</p>
            <p className="font-serif text-2xl font-bold">{totalVouchers}</p>
            <p className="text-muted-foreground text-xs">
              {allUnused.length} nomor aktif · {totalUsed} nomor habis
            </p>
          </div>
          <Button onClick={copyAll} className="h-11 px-4 text-sm">
            <Copy className="size-4" />
            Copy unused
          </Button>
        </Card>

        <ul className="space-y-3">
          {ROOMS.map((room) => {
            const slots = data.rooms[room.id]
            const used = usedCount(slots)
            const done = used === slots.length
            return (
              <li key={room.id}>
                <Link href={`/room/${room.id}`} className="block">
                  <Card className="flex items-center gap-3 active:translate-y-px">
                    <div className="min-w-0 flex-1">
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
