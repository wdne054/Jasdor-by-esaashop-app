"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Copy, Trash2, Coffee, Check, Plus } from "lucide-react"

type BaperanNumber = {
  id: string
  number: string
  pin: string
  used: boolean
  usedAt: number | null
}

const STORAGE_KEY = "jasdor.baperan.v1"

function readNumbers(): BaperanNumber[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveNumbers(items: BaperanNumber[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function parseNumbers(input: string) {
  return input
    .split(/[\s,;]+/)
    .map((n) => n.trim())
    .filter(Boolean)
}

export default function BaperanPage() {
  const [items, setItems] = useState<BaperanNumber[]>([])
  const [mounted, setMounted] = useState(false)
  const [input, setInput] = useState("")
  const [pin, setPin] = useState("")
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setItems(readNumbers())
    setMounted(true)
  }, [])

  function update(next: BaperanNumber[]) {
    setItems(next)
    saveNumbers(next)
  }

  function addNumbers() {
    const numbers = parseNumbers(input)

    if (numbers.length === 0) {
      setError("Masukkan minimal 1 nomor.")
      return
    }

    const cleanPin = pin.replace(/\s+/g, "").trim()

    if (!cleanPin) {
      setError("PIN wajib diisi.")
      return
    }

    const existing = new Set(items.map((x) => x.number))

    const newItems = numbers
      .filter((number) => !existing.has(number))
      .map((number, index) => ({
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
        number,
        pin: cleanPin,
        used: false,
        usedAt: null,
      }))

    if (newItems.length === 0) {
      setError("Semua nomor tersebut sudah ada.")
      return
    }

    update([...newItems, ...items])
    setInput("")
    setPin("")
    setError("")
    setShowAdd(false)
  }

  function markAsUsed(id: string) {
    const next = items.map((item) =>
      item.id === id
        ? {
            ...item,
            used: true,
            usedAt: Date.now(),
          }
        : item,
    )

    update(next)
  }

  function removeNumber(id: string) {
    update(items.filter((item) => item.id !== id))
  }

  async function copyAvailable() {
    const numbers = items.filter((item) => !item.used).map((item) => item.number)

    if (!numbers.length) return

    try {
      await navigator.clipboard.writeText(numbers.join("\n"))
    } catch {}
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return items

    return items.filter(
      (item) =>
        item.number.toLowerCase().includes(q) ||
        item.pin.toLowerCase().includes(q),
    )
  }, [items, search])

  const available = items.filter((item) => !item.used).length
  const used = items.filter((item) => item.used).length

  if (!mounted) {
    return (
      <main className="min-h-screen bg-background">
        <div className="p-4 text-center">Memuat BAPERAN…</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-4">
          <Link
            href="/"
            aria-label="Kembali"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Coffee className="size-5" />
              <h1 className="font-serif text-xl font-bold">
                BAPERAN
              </h1>
            </div>
            <p className="text-muted-foreground text-xs">
              1 nomor = 1x pakai · PIN masing-masing
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-3 px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-muted-foreground text-xs">Siap dipakai</p>
            <p className="mt-1 text-2xl font-bold">{available}</p>
          </div>

          <div className="rounded-2xl border bg-card p-4">
            <p className="text-muted-foreground text-xs">Sudah dipakai</p>
            <p className="mt-1 text-2xl font-bold">{used}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAdd(true)
            setError("")
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-semibold text-primary-foreground"
        >
          <Plus className="size-5" />
          Tambah Nomor
        </button>

        <button
          type="button"
          onClick={copyAvailable}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border bg-card px-4 text-sm font-semibold"
        >
          <Copy className="size-4" />
          Copy semua nomor yang belum dipakai
        </button>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nomor atau PIN…"
          className="h-12 w-full rounded-xl border bg-background px-4 font-mono text-sm outline-none focus:ring-2"
        />

        {showAdd ? (
          <div className="rounded-2xl border bg-card p-4">
            <p className="font-semibold">Tambah nomor BAPERAN</p>

            <p className="text-muted-foreground mt-1 text-xs">
              Bisa masukkan banyak nomor sekaligus. Pisahkan dengan Enter,
              spasi, koma, atau titik koma.
            </p>

            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setError("")
              }}
              rows={5}
              inputMode="tel"
              placeholder={"08123456789\n08123456788\n08123456787"}
              className="mt-3 w-full rounded-xl border bg-background p-3 font-mono text-base outline-none focus:ring-2"
            />

            <input
              value={pin}
              onChange={(e) => {
                setPin(e.target.value)
                setError("")
              }}
              inputMode="numeric"
              placeholder="PIN nomor ini"
              className="mt-3 h-12 w-full rounded-xl border bg-background px-3 font-mono text-base outline-none focus:ring-2"
            />

            {error ? (
              <p className="text-destructive mt-2 text-sm font-semibold">
                {error}
              </p>
            ) : null}

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false)
                  setError("")
                }}
                className="h-11 flex-1 rounded-xl border font-semibold"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={addNumbers}
                className="h-11 flex-1 rounded-xl bg-primary font-semibold text-primary-foreground"
              >
                Simpan
              </button>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border bg-card p-6 text-center">
              <Coffee className="mx-auto size-8 opacity-50" />
              <p className="mt-2 font-semibold">
                Belum ada nomor BAPERAN
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Tekan “Tambah Nomor” untuk mulai.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border bg-card p-4 ${
                  item.used ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-mono text-lg font-bold tracking-wide ${
                        item.used ? "line-through" : ""
                      }`}
                    >
                      {item.number}
                    </p>

                    <p className="mt-1 font-mono text-sm">
                      PIN: <span className="font-bold">{item.pin}</span>
                    </p>

                    <p className="text-muted-foreground mt-1 text-xs">
                      {item.used
                        ? "❌ Sudah dipakai"
                        : "☕ Belum dipakai · 1x tersedia"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeNumber(item.id)}
                    aria-label="Hapus nomor"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {!item.used ? (
                  <button
                    type="button"
                    onClick={() => markAsUsed(item.id)}
                    className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground"
                  >
                    <Check className="size-5" />
                    PAKAI
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
      }
