"use client"

import { useState } from "react"
import { AppHeader, Card, Modal, useToast } from "@/components/app-ui"
import { Button } from "@/components/ui/button"
import { ROOMS, resetAll, useAppData, usedCount } from "@/lib/store"

export default function SettingsPage() {
  const data = useAppData()
  const { toast, ToastView } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const totalUsed = data ? ROOMS.reduce((n, r) => n + usedCount(data.rooms[r.id]), 0) : 0

  return (
    <main>
      <AppHeader title="Setelan" subtitle="Jasdor by Esaashop" />
      <div className="space-y-3 px-4">
        <Card>
          <p className="text-sm font-semibold">Data tersimpan di HP ini</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Semua nomor dan riwayat disimpan di penyimpanan lokal browser. Tidak ada server, tidak perlu
            login.
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            {ROOMS.length} room · {totalUsed} nomor terpakai · {data?.history.length ?? 0} riwayat
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
