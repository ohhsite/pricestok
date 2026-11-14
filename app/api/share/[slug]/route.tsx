import { ImageResponse } from "next/og";
import { listOffers } from "../../../lib/repository";
import { dateLabel, isActive } from "../../../lib/data";
import { shareImage } from "../../../lib/share-image";

export const runtime = "nodejs";

function shorten(value: string, limit: number) {
  if (value.length <= limit) return value;
  return value.slice(0, limit).replace(/\s+\S*$/, "") + "…";
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const offer = (await listOffers()).find((entry) => entry.slug === slug && entry.status === "published");
  if (!offer) return new Response("Nie znaleziono oferty", { status: 404 });

  const image = await shareImage(offer);
  const active = isActive(offer);
  const title = shorten(offer.title, 115);
  const shortTitle = title.length < 65;
  const res = new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#fffaf1", color: "#25231f", padding: "36px 48px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20, borderBottom: "2px solid #efdcc7" }}>
        <span style={{ fontSize: 34, fontWeight: 700 }}>PriceStok<span style={{ color: "#e98108" }}>.</span></span>
        <span style={{ fontSize: 23, fontWeight: 700, letterSpacing: 2 }}>BIAŁYSTOK</span>
      </div>
      <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 34 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 12 }}>
          <span style={{ display: "flex", alignSelf: "flex-start", background: "#ffdfad", borderRadius: 8, padding: "6px 14px", fontSize: 22, fontWeight: 700 }}>{active ? shorten(offer.badge || offer.company, 48) : "Oferta poza terminem"}</span>
          <span style={{ fontSize: image ? (shortTitle ? 49 : 41) : (shortTitle ? 62 : 52), fontWeight: 700, lineHeight: 1.08 }}>{title}</span>
          <span style={{ fontSize: 24, color: "#6b5541" }}>{shorten(offer.address || offer.company, 74)}</span>
          {offer.end && <span style={{ fontSize: 22 }}>Do {dateLabel(offer.end)}</span>}
        </div>
        {image && <div style={{ display: "flex", width: 400, height: 320, flexShrink: 0, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 22, background: image.photo ? "#ede2d3" : ["chilli-pizza", "na-lipowej", "magic-gym", "beauty-bar", "aleja-piekna"].includes(offer.companySlug) ? "#252a22" : "#ffffff" }}>
          <img src={image.src} width={image.photo ? 405 : 350} height={image.photo ? 320 : 277} />
        </div>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 17, borderTop: "2px solid #efdcc7", fontSize: 23, fontWeight: 700 }}>
        <span>{shorten(offer.company, 54)}</span><span style={{ color: "#945006" }}>pricestok.pl</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
  res.headers.set("Cache-Control", "public, max-age=300, s-maxage=3600");
  if (new URL(req.url).searchParams.get("download") === "1")
    res.headers.set("Content-Disposition", `attachment; filename="pricestok-${slug}.png"`);
  return res;
}
