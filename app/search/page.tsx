"use client"

import Link from "next/link"
import { useState } from "react"
import { AppHeader, Card, Field } from "@/components/app-ui"
import { ROOMS, USES_PER_NUMBER, formatTime, roomPin, useAppData, usesLabel } from "@/lib/store"

export default function SearchPage() {
  const data = useAppData()
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()

  const results =
    data && q
      ? ROOMS.flatMap((room) =>
          data.rooms[room.id]
            .map((slot, i) => ({ room, slot, index: i }))
            .filter(
              ({ slot }) =>
                slot.number.toLowerCase().includes(q) || slot.buyer.toLowerCase().includes(q),
            ),
        )
      : []

  const historyHits =
    data && q
      ? data.history.filter(
          (h) => h.number.toLowerCase().includes(q) || h.buyer.toLowerCase().includes(q),
        )
      : []

  return (
    <main>
      <AppHeader title="Cari nomor" subtitle="Cari di room dan riwayat" />
      <div className="space-y-3 px-4">
        <Field
          aria-label="Kata kunci"
          inputMode="search"
          placeholder="Nomor atau nama pembeli…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {!q ? (
          <p className="text-muted-foreground px-1 text-sm">Ketik untuk mulai mencari.</p>
        ) : (
          <>
            <p className="text-muted-foreground px-1 text-sm font-semibold">
              Di room ({results.length})
            </p>
            {results.length === 0 ? (
              <Card>
                <p className="text-muted-foreground text-sm">Tidak ada di room.</p>
              </Card>
            ) : (
              <ul className="space-y-2">
                {results.map(({ room, slot, index }) => (
                  <li key={`${room.id}-${index}`}>
                    <Link href={`/room/${room.id}`}>
                      <Card>
                        <p className="font-mono text-base font-semibold">{slot.number}</p>
                        <p className="text-muted-foreground text-xs">
                          {room.name} · PIN {roomPin(data, room.id)} · slot {index + 1} ·{" "}
                          {usesLabel(slot)}
                          {slot.buyer ? ` · ${slot.buyer}` : ""}
                        </p>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-muted-foreground px-1 pt-2 text-sm font-semibold">
              Di riwayat ({historyHits.length})
            </p>
            {historyHits.length === 0 ? (
              <Card>
                <p className="text-muted-foreground text-sm">Tidak ada di riwayat.</p>
              </Card>
            ) : (
              <ul className="space-y-2">
                {historyHits.map((h) => (
                  <li key={h.id}>
                    <Card>
                      <p className="font-mono text-base font-semibold">{h.number}</p>
                      <p className="text-muted-foreground text-xs">
                        {h.roomName} · slot {h.slot} · pakai ke-{h.useNo}/{USES_PER_NUMBER} ·{" "}
                        {formatTime(h.at)}
                        {h.buyer ? ` · ${h.buyer}` : ""}
                      </p>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  )
}
