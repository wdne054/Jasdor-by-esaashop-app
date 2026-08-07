"use client"

import { useState } from "react"
import { AppHeader, Card, Field, Modal, useToast } from "@/components/app-ui"
import { Button } from "@/components/ui/button"
import {
  ROOMS,
  USES_PER_NUMBER,
  remainingUses,
  resetAll,
  roomPin,
  setRoomPin,
  useAppData,
  usedCount,
} from "@/lib/store"

export default function SettingsPage() {
  const data = useAppData()
  const { toast, ToastView } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const totalUsed = data ? ROOMS.reduce((n, r) => n + usedCount(data.rooms[r.id]), 0) : 0
  const totalVouchers = data ? ROOMS.reduce((n, r) => n + remainingUses(data.rooms[r.id]), 0) : 0

  return (
    <main>
      <AppHeader title="Setelan" subtitle="Jasdor by Esaashop" />
      <div className="space-y-3 px-4">
        <Card>
          <p className="text-sm font-semibold">PIN tiap room</p>
          <p className="text-muted-foreground mt-1 mb-3 text-sm">
            PIN ini tampil di kartu room dan di halaman room. Reset room tidak mengubah PIN.
          </p>
          <ul className="space-y-2">
            {ROOMS.map((room) => (
              <li key={room.id} className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{room.name}</span>
                <Field
                  aria-label={`PIN ${room.name}`}
                  inputMode="numeric"
                  value={roomPin(data, room.id)}
                  onChange={(e) => setRoomPin(room.id, e.target.value)}
                  className="h-11 w-32 font-mono tracking-widest"
                />
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <p className="text-sm font-semibold">Data tersimpan di HP ini</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Semua nomor dan riwayat disimpan di penyimpanan lokal browser. Tidak ada server, tidak perlu
            login.
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            {ROOMS.length} room · {USES_PER_NUMBER}x pakai per nomor · {totalVouchers} voucher tersisa ·{" "}
            {totalUsed} nomor habis · {data?.history.length ?? 0} riwayat
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold">Pasang di layar utama</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Buka menu browser (tiga titik) lalu pilih &quot;Tambahkan ke layar utama&quot; agar Jasdor terbuka
            seperti aplikasi.
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold">Reset semua data</p>
          <p className="text-muted-foreground mt-1 mb-3 text-sm">
            Menghapus semua nomor di 5 room dan seluruh riwayat. Tidak bisa dibatalkan.
          </p>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)} className="h-12 w-full text-base">
            Reset semua data
          </Button>
        </Card>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Reset semua data?">
        <p className="text-muted-foreground mb-3 text-sm">
          Semua nomor dan riwayat akan hilang permanen.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            variant="destructive"
            onClick={() => {
              resetAll()
              setConfirmOpen(false)
              toast("Semua data direset")
            }}
            className="h-12 w-full text-base"
          >
            Ya, reset sekarang
          </Button>
          <Button variant="ghost" onClick={() => setConfirmOpen(false)} className="h-11 w-full text-base">
            Batal
          </Button>
        </div>
      </Modal>

      {ToastView}
    </main>
  )
}
