export const dynamic = "force-static"

export function GET() {
  return Response.json({
    name: "Jasdor by Esaashop",
    short_name: "Jasdor",
    description: "Pencatat nomor telepon penjualan kopi — 5 room, 3 nomor tiap room.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f1e5d3",
    theme_color: "#f1e5d3",
    lang: "id",
    icons: [
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  })
}
