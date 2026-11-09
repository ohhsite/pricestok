"use client";
import { useState } from "react";
export default function HolidayBrand({ slug, name, dark = false }: { slug: string; name: string; dark?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <div className={"holiday-brand" + (dark ? " holiday-brand-dark" : "")}>
    {failed ? <strong>{name}</strong> : <img src={"/brands/" + slug + ".webp"} alt={"Logo " + name} loading="lazy" onError={() => setFailed(true)} />}
  </div>;
}
