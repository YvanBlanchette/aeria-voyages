"use client";

import { Star } from "lucide-react";
import { GOLD } from "@/lib/constants/all-inclusive-constants";


export function renderStars(Stars) {
  if (Stars === "grandluxe") return (
    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: GOLD }}>Grand Luxe</span>
  );
  if (!Stars) return null;
  const full = Math.floor(Stars);
  const half = Stars % 1 >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={i} className="size-2.5 fill-current" style={{ color: GOLD }} />
      ))}
      {half && <span className="text-[9px] leading-none" style={{ color: GOLD }}>½</span>}
    </span>
  );
}


export function jsDateToConst(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()}${months[d.getMonth()]}${d.getFullYear()}`;
}

// Date par défaut = dans 30 jours, format YYYY-MM-DD pour <input type="date">
export function defaultDateInput() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export function triPackages(packages, tri) {
  const s = [...packages];
  const toNum = e => e === "grandluxe" ? 5.5 : (e || 0);
  switch (tri) {
    case "prix-asc":     return s.sort((a, b) => a.prix - b.prix);
    case "prix-desc":    return s.sort((a, b) => b.prix - a.prix);
    case "etoiles-desc": return s.sort((a, b) => toNum(b.etoiles) - toNum(a.etoiles));
    case "etoiles-asc":  return s.sort((a, b) => toNum(a.etoiles) - toNum(b.etoiles));
    case "nom-asc":      return s.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    default:             return s;
  }
}