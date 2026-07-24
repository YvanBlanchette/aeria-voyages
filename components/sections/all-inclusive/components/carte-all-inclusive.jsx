"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { renderStars } from "@/lib/helpers/all-inclusive-helpers";

const CarteAllInclusive = ({ forfait, onClick }) => {
  return (
    <button
      onClick={() => onClick(forfait)}
      className="card-lift group text-left flex gap-0 bg-white overflow-hidden cursor-pointer w-full h-[90px] rounded-xl"
    >
      {/* Image */}
      <div className="relative shrink-0 overflow-hidden ratio-video h-full w-[150px] bg-[#e8e4dc]">
        {forfait.image && (
          <Image
            src={forfait.image}
            alt={forfait.nom}
            fill
            sizes="150px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, rgba(255,255,255,0.15))" }} />
      </div>

      {/* Contenu */}
      <div className="flex flex-col justify-between flex-1 py-2.5 px-3 min-w-0 border-l border-stone-100">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            {renderStars(forfait.etoiles)}
          </div>
          <p className="font-serif text-sm leading-snug text-stone-800 group-hover:text-gold transition-colors duration-200 line-clamp-1">
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