"use client"

import { useState } from "react"
import {
  AppHeader,
  Card,
  Field,
  Modal,
  useToast,
} from "@/components/app-ui"
import { Button } from "@/components/ui/button"
import {
  addRoom,
  removeRoom,
  resetAll,
  roomPin,
  setRoomPin,
  useAppData,
  usedCount,
  remainingUses,
  setRoomName,
  moveRoom,
} from "@/lib/store"

export default function SettingsPage() {
  const data = useAppData()
  const { toast, ToastView } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!data) {
    return (
      <main>
        <AppHeader title="Setelan" subtitle="Jasdor by Esaashop" />
        <div className="px-4">
          <Card>
            <p className="text-sm text-muted-foreground">
              Memuat data...
            </p>
          </Card>
        </div>
      </main>
    )
  }

  const rooms = data.roomOrder.map((id) => ({
    id,
    name: data.roomNames[id] ?? id,
  }))

  const totalUsed = rooms.reduce(
    (n, r) => n + usedCount(data.rooms[r.id]),
    0,
  )

  const totalVouchers = rooms.reduce(
    (n, r) => n + remainingUses(data.rooms[r.id]),
    0,
  )

  return (
    <main>
      <AppHeader
        title="Setelan"
        subtitle="Jasdor by Esaashop"
      />

      <div className="space-y-3 px-4 pb-6">

        {/* ROOM */}
        <Card>
          <p className="text-sm font-semibold">
            Atur ROOM
          </p>

          <p className="mt-1 mb-3 text-sm text-muted-foreground">
            Kamu bisa mengubah nama dan posisi ROOM.
          </p>

          <div className="space-y-3">
            {rooms.map((room, index) => (
              <div
                key={room.id}
                className="rounded-2xl border p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    ROOM {index + 1}
                  </span>

                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => moveRoom(room.id, "up")}
                    >
                      ↑
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={index === rooms.length - 1}
                      onClick={() => moveRoom(room.id, "down")}
                    >
                      ↓
                    </Button>
                  </div>
                </div>

                <Field
                  aria-label={`Nama ${room.name}`}
                  value={room.name}
                  onChange={(e) =>
                    setRoomName(room.id, e.target.value)
                  }
                  className="mb-2 h-11"
                  placeholder="Nama ROOM"
                />

                <Field
                  aria-label={`PIN ${room.name}`}
                  inputMode="numeric"
                  value={roomPin(data, room.id)}
                  onChange={(e) =>
                    setRoomPin(room.id, e.target.value)
                  }
                  className="h-11 font-mono tracking-widest"
                  placeholder="PIN"
                />

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (
                      confirm(
                        `Hapus ${room.name}? Semua nomor di ROOM ini akan ikut dihapus.`,
                      )
                    ) {
                      removeRoom(room.id)
                      toast(`${room.name} dihapus`)
                    }
                  }}
                  className="mt-2 h-10 w-full"
                >
                  Hapus ROOM
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={() => {
              addRoom()
              toast("ROOM baru ditambahkan")
            }}
            className="mt-3 h-12 w-full"
          >
            + Tambah ROOM
          </Button>
        </Card>

        {/* DATA */}
        <Card>
          <p className="text-sm font-semibold">
            Data tersimpan di HP ini
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Semua nomor dan riwayat disimpan di penyimpanan
            lokal browser. Tidak ada server, tidak perlu login.
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            {rooms.length} room · 3x pakai per nomor ·{" "}
            {totalVouchers} voucher tersisa ·{" "}
            {totalUsed} nomor habis ·{" "}
            {data.history.length} riwayat
          </p>
        </Card>

        {/* INSTALL */}
        <Card>
          <p className="text-sm font-semibold">
            Pasang di layar utama
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Buka menu browser (tiga titik) lalu pilih
            &quot;Tambahkan ke layar utama&quot; agar Jasdor
            terbuka seperti aplikasi.
          </p>
        </Card>

        {/* RESET */}
        <Card>
          <p className="text-sm font-semibold">
            Reset semua data
          </p>

          <p className="mt-1 mb-3 text-sm text-muted-foreground">
            Menghapus semua nomor di seluruh ROOM dan seluruh
            riwayat. Tidak bisa dibatalkan.
          </p>

          <Button
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
            className="h-12 w-full text-base"
          >
            Reset semua data
          </Button>
        </Card>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Reset semua data?"
      >
        <p className="mb-3 text-sm text-muted-foreground">
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

          <Button
            variant="ghost"
            onClick={() => setConfirmOpen(false)}
            className="h-11 w-full text-base"
          >
            Batal
          </Button>
        </div>
      </Modal>

      {ToastView}
    </main>
  )
}
