"use client";
import { useEffect } from "react";
export default function TrackView({ id }: { id: string }) {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }, [id]);
  return null;
}
