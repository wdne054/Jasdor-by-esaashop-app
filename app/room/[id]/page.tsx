"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, ClipboardPaste, Copy, Pencil, Trash2 } from "lucide-react"
import { AppHeader, Card, Field, Modal, PinBadge, UsesBadge, useToast } from "@/components/app-ui"
import { Button } from "@/components/ui/button"
import {
  ROOMS,
  USES_PER_NUMBER,
  clearSlot,
  copyText,
  fillEmptySlots,
  formatTime,
  isRoomFinished,
  markUsed,
  parseNumbers,
  remainingUses,
  resetRoom,
  roomPin,
  setRoomPin,
  setSlotNumber,
  unusedNumbers,
  useAppData,
  usedCount,
  usesLabel,
} from "@/lib/store"

export default function RoomPage() {
  const params = useParams<{ id: string }>()
  const roomId = params.id
  const room = ROOMS.find((r) => r.id === roomId)
  const data = useAppData()
  const { toast, ToastView } = useToast()

  const [pasteOpen, setPasteOpen] = useState(false)
  const [pasteText, setPasteText] = useState("")
  const [pasteError, setPasteError] = useState<string | null>(null)

  const [useIndex, setUseIndex] = useState<number | null>(null)
  const [buyer, setBuyer] = useState("")

  const [pinOpen, setPinOpen] = useState(false)
  const [pinDraft, setPinDraft] = useState("")

  const [doneDismissed, setDoneDismissed] = useState(false)

  const slots = room && data ? data.rooms[room.id] : null
  const finished = slots ? isRoomFinished(slots) : false

  useEffect(() => {
    if (!finished) setDoneDismissed(false)
  }, [finished])

  if (!room) {
    return (
      <main>
        <AppHeader title="Room tidak ada" />
        <div className="px-4">
          <Card>
            <p className="mb-3 text-sm">Hanya ada 5 room tetap.</p>
            <Link href="/">
              <Button className="h-11 px-4">Kembali ke daftar room</Button>
            </Link>
          </Card>
        </div>
      </main>
    )
  }

  if (!slots) {
    return <AppHeader title={room.name} subtitle="Memuat data…" />
  }

  const used = usedCount(slots)
  const unused = unusedNumbers(slots)
  const vouchers = remainingUses(slots)
  const pin = roomPin(data, room.id)

  function submitPaste() {
    const numbers = parseNumbers(pasteText)
    if (numbers.length !== 3) {
      setPasteError(`Harus tepat 3 nomor. Terbaca ${numbers.length}.`)
      return
    }
    const emptyCount = slots!.filter((s) => !s.used && !s.number).length
    if (emptyCount === 0) {
      setPasteError("Tidak ada slot kosong di room ini.")
      return
    }
    fillEmptySlots(room!.id, numbers)
    setPasteOpen(false)
    setPasteText("")
    setPasteError(null)
    toast(`${Math.min(emptyCount, 3)} nomor masuk`)
  }

  async function copyUnused() {
    if (unused.length === 0) {
      toast("Tidak ada nomor tersisa")
      return
    }
    const ok = await copyText(unused.join("\n"))
    toast(ok ? `${unused.length} nomor dicopy` : "Gagal copy")
  }

  function confirmUse() {
    if (useIndex === null) return
    const before = slots![useIndex].usesLeft
    markUsed(room!.id, useIndex, buyer)
    setUseIndex(null)
    setBuyer("")
    const left = before - 1
    toast(left > 0 ? `Terpakai · sisa ${left}x` : "Nomor habis terpakai")
  }

  function savePin() {
    const clean = pinDraft.replace(/\s+/g, "")
    if (!clean) {
      toast("PIN tidak boleh kosong")
      return
    }
    setRoomPin(room!.id, clean)
    setPinOpen(false)
    toast("PIN disimpan")
  }

  function startNewRound() {
    resetRoom(room!.id)
    setDoneDismissed(true)
    setPasteOpen(true)
  }

  return (
    <main>
      <AppHeader
        title={room.name}
        subtitle={`${used}/${slots.length} nomor habis · ${vouchers} voucher tersisa`}
        left={
          <Link href="/" aria-label="Kembali" className="text-muted-foreground -ml-2 p-2">
            <ArrowLeft className="size-6" />
          </Link>
        }
      />

      <div className="space-y-3 px-4">
        <div className="flex items-center gap-2 px-1">
          <PinBadge pin={pin} />
          <button
            type="button"
            onClick={() => {
              setPinDraft(pin)
              setPinOpen(true)
            }}
            className="text-muted-foreground inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold underline-offset-2 hover:underline"
          >
            <Pencil className="size-3.5" />
            Ubah PIN
          </button>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setPasteOpen(true)} className="h-12 flex-1 text-base">
            <ClipboardPaste className="size-5" />
            Paste 3
          </Button>
          <Button variant="outline" onClick={copyUnused} className="h-12 flex-1 text-base">
            <Copy className="size-5" />
            Copy unused
          </Button>
        </div>

        <ol className="space-y-3">
          {slots.map((slot, i) => (
            <li key={i}>
              <Card className={slot.used ? "bg-secondary" : undefined}>
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    {slot.number ? (
                      <p
                        className={
                          "font-mono text-lg font-semibold tracking-wide " +
                          (slot.used ? "text-muted-foreground line-through" : "")
                        }
                      >
                        {slot.number}
                      </p>
                    ) : (
                      <Field
                        aria-label={`Nomor slot ${i + 1}`}
                        inputMode="tel"
                        placeholder="Isi nomor…"
                        onBlur={(e) => {
                          const v = e.currentTarget.value.trim()
                          if (v) setSlotNumber(room.id, i, v)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                            e.currentTarget.blur()
                          }
                        }}
                      />
                    )}

                    {slot.number ? (
                      <div className="mt-2">
                        <UsesBadge usesLeft={slot.usesLeft} total={USES_PER_NUMBER} />
                      </div>
                    ) : null}

                    <p className="text-muted-foreground mt-1.5 text-xs">
                      {slot.number
                        ? slot.usedAt
                          ? `Terakhir dipakai ${formatTime(slot.usedAt)}${slot.buyer ? ` · ${slot.buyer}` : ""}`
                          : "Belum pernah dipakai"
                        : "Slot kosong"}
                    </p>
                  </div>
                </div>

                {slot.number ? (
                  <div className="mt-3 flex gap-2">
                    <Button
                      disabled={slot.usesLeft === 0}
                      onClick={() => {
                        setUseIndex(i)
                        setBuyer("")
                      }}
                      className="h-12 flex-1 text-base"
                    >
                      {slot.usesLeft === 0 ? "Habis" : "Pakai"}
                    </Button>
                    <Button
                      variant="outline"
                      aria-label={`Hapus nomor slot ${i + 1}`}
                      onClick={() => clearSlot(room.id, i)}
                      className="size-12"
                    >
                      <Trash2 className="size-5" />
                    </Button>
                  </div>
                ) : null}
              </Card>
            </li>
          ))}
        </ol>
      </div>

      {/* Paste 3 */}
      <Modal
        open={pasteOpen}
        onClose={() => {
          setPasteOpen(false)
          setPasteError(null)
        }}
        title="Paste 3 nomor"
      >
        <p className="text-muted-foreground mb-2 text-sm">
          Pisahkan dengan baris baru, spasi, atau koma. Harus tepat 3 nomor. Tiap nomor dapat{" "}
          {USES_PER_NUMBER}x pakai.
        </p>
        <textarea
          value={pasteText}
          onChange={(e) => {
            setPasteText(e.target.value)
            setPasteError(null)
          }}
          rows={4}
          inputMode="tel"
          autoFocus
          placeholder={"08123456789\n08123456788\n08123456787"}
          className="bg-background border-border focus-visible:border-ring focus-visible:ring-ring/40 w-full rounded-xl border p-3 font-mono text-base outline-none focus-visible:ring-3"
        />
        {pasteError ? (
          <p role="alert" className="text-destructive mt-2 text-sm font-semibold">
            {pasteError}
          </p>
        ) : null}
        <Button onClick={submitPaste} className="mt-3 h-12 w-full text-base">
          Masukkan ke slot kosong
        </Button>
      </Modal>

      {/* Pakai */}
      <Modal open={useIndex !== null} onClose={() => setUseIndex(null)} title="Pakai 1 voucher">
        <p className="font-mono mb-1 text-lg font-semibold">
          {useIndex !== null ? slots[useIndex].number : ""}
        </p>
        <p className="text-muted-foreground mb-3 text-sm">
          {useIndex !== null ? usesLabel(slots[useIndex]) : ""} · PIN {pin}
        </p>
        <Field
          label="Nama pembeli (opsional)"
          value={buyer}
          onChange={(e) => setBuyer(e.target.value)}
          placeholder="Contoh: Budi"
        />
        <Button onClick={confirmUse} className="mt-3 h-12 w-full text-base">
          Simpan ke riwayat
        </Button>
      </Modal>

      {/* Ubah PIN */}
      <Modal open={pinOpen} onClose={() => setPinOpen(false)} title={`PIN ${room.name}`}>
        <Field
          label="PIN room"
          value={pinDraft}
          onChange={(e) => setPinDraft(e.target.value)}
          inputMode="numeric"
          autoFocus
          placeholder="111111"
          className="font-mono tracking-widest"
        />
        <Button onClick={savePin} className="mt-3 h-12 w-full text-base">
          Simpan PIN
        </Button>
      </Modal>

      {/* Room selesai */}
      <Modal
        open={finished && !doneDismissed}
        onClose={() => setDoneDismissed(true)}
        title="Room selesai, masukkan 3 nomor baru."
      >
        <p className="text-muted-foreground mb-3 text-sm">
          Semua 3 nomor di {room.name} sudah habis {USES_PER_NUMBER}x pakai. Kosongkan room ini lalu isi 3
          nomor baru.
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={startNewRound} className="h-12 w-full text-base">
            Isi 3 nomor baru
          </Button>
          <Button variant="ghost" onClick={() => setDoneDismissed(true)} className="h-11 w-full text-base">
            Nanti saja
          </Button>
        </div>
      </Modal>

      {ToastView}
    </main>
  )
}
