"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { Coffee, Search, History, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "Room", icon: Coffee },
  { href: "/search", label: "Cari", icon: Search },
  { href: "/history", label: "Riwayat", icon: History },
  { href: "/settings", label: "Setelan", icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.log("[v0] service worker registration failed:", err)
      })
    }
  }, [])

  return (
    <nav
      aria-label="Navigasi utama"
      className="bg-[#fffaf6]/95 border-[#eadbd3] fixed inset-x-0 bottom-0 z-40 border-t shadow-[0_-4px_18px_rgba(91,61,43,0.08)] backdrop-blur"
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" || pathname.startsWith("/room") : pathname === href
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 text-[13px] font-semibold",
                  active ? "text-[#8b5e3c]" : "text-[#8d7768]",
                )}
              >
                <Icon className="size-6" aria-hidden="true" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
