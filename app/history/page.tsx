"use client"

import { AppHeader, Card } from "@/components/app-ui"
import { formatTime, useAppData } from "@/lib/store"

export default function HistoryPage() {
  const data = useAppData()

  if (!data) return <AppHeader title="Riwayat" subtitle="Memuat data…" />

  return (
    <main>
      <AppHeader title="Riwayat" subtitle={`${data.history.length} nomor terpakai`} />
      <div className="px-4">
        {data.history.length === 0 ? (
          <Card>
            <p className="text-muted-foreground text-sm">
              Belum ada riwayat. Tekan &quot;Pakai&quot; di sebuah room untuk mencatat nomor.
            </p>
          </Card>
        ) : (
          <ul className="space-y-2">
            {data.history.map((h) => (
              <li key={h.id}>
                <Card>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-mono text-base font-semibold">{h.number}</p>
                    <p className="text-muted-foreground text-xs">{formatTime(h.at)}</p>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {h.roomName} · slot {h.slot}
                    {h.buyer ? ` · ${h.buyer}` : ""}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
