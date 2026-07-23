"use client";

import { MapPin } from "lucide-react";
import { renderStars } from "@/lib/helpers/all-inclusive-helpers";

const CarteAllInclusive = ({ forfait, onClick }) => {
  return (
    <button
      onClick={() => onClick(forfait)}
      className="group text-left flex gap-0 bg-white overflow-hidden cursor-pointer w-full h-[90px]"
      style={{
        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 8px 28px rgba(184,147,92,0.15), 0 0 0 1px rgba(184,147,92,0.25)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Image */}
      <div className="relative shrink-0 overflow-hidden ratio-video h-full w-[150px]">
        <img
          src={forfait.image}
          alt={forfait.nom}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={e => { e.target.parentElement.style.background = "#e8e4dc"; e.target.style.display = "none"; }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, rgba(255,255,255,0.15))" }} />
      </div>

      {/* Contenu */}
      <div className="flex flex-col justify-between flex-1 py-2.5 px-3 min-w-0 border-l border-stone-100">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            {renderStars(forfait.etoiles)}
          </div>
          <p className="font-serif text-sm leading-snug text-stone-800 group-hover:text-[#B8935C] transition-colors duration-200 line-clamp-1">
            {forfait.nom}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1 line-clamp-1">
            <MapPin className="size-2.5 shrink-0" />
            {forfait.region}
          </p>
        </div>
        <div className="flex items-baseline gap-1 mt-1.5">
          <span className="text-[10px] text-stone-400">à partir de</span>
          <span className="text-sm font-bold text-stone-900">{forfait.prix.toLocaleString("fr-CA")} $</span>
        </div>
      </div>
    </button>
  );
}

export default CarteAllInclusive;