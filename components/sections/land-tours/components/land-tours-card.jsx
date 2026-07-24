"use client";

import Image from "next/image";
import { Card, CardTitle } from "@/components/ui/card";
import { ChevronRight, MapPin, Calendar, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { REGION_LABELS } from "@/lib/constants/land-tours-constants";

const LandToursCard = ({ tour }) => {
  const image        = tour.image_url   ?? tour.image ?? "";
  const titre        = tour.titre       ?? tour.nom   ?? "";
  const dest         = tour.destination ?? "";
  const jours        = tour.jours       ?? "";
  const region       = tour.region      ?? "";
  const lien         = tour.lienAgent   ?? tour.url_tour ?? "#";
  const prixPromo    = tour.prixPromo   ?? tour.prix  ?? null;
  const prixRegulier = tour.prixRegulier ?? null;
  const rabais       = tour.rabais      ?? tour.rabais_pct ?? null;

  return (
    <a href={lien} target="_blank" rel="noopener noreferrer"
      className="destination-card group block overflow-hidden transition-all duration-700 hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)]"
    >
      <Card className="overflow-hidden border-none h-full rounded-2xl aspect-square">
        <div className="relative overflow-hidden min-h-84 h-full w-auto bg-stone-200">
          {image && (
            <Image
              src={image}
              alt={titre}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="destination-overlay" />
          {rabais && (
            <div className="absolute top-4 start-4 z-10">
              <Badge className="bg-gold text-white font-medium text-base px-3">{rabais} rabais</Badge>
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 p-6 z-10 text-white destination-info">
            {dest && (
              <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase mb-2">
                <MapPin className="size-3.5" />{dest}
              </div>
            )}
            <CardTitle className="font-serif text-2xl text-white mb-3 leading-tight">{titre}</CardTitle>
            <div className="flex items-center gap-4 text-sm mb-3">
    {jours && <span className="flex items-center gap-1.5"><Calendar className="size-4" />{jours} jours</span>}
    {tour.mois && (
        <span className="flex items-center gap-1.5">
            <Calendar className="size-4" />
            {new Date(tour.mois + "-02").toLocaleDateString("fr-CA", { month: "long", year: "numeric" })}
        </span>
    )}
    {region && <span className="flex items-center gap-1.5"><Tag className="size-4" />{REGION_LABELS[region] ?? region}</span>}
</div>
            {(prixPromo || prixRegulier) && (
              <>
                <Separator className="my-3 opacity-30" />
                <div className="flex items-center justify-between">
                  <div>
                    {prixRegulier && <p className="text-sm opacity-60 line-through">{Number(prixRegulier).toLocaleString("fr-CA")} $</p>}
                    {prixPromo    && <p className="text-xl font-bold">{Number(prixPromo).toLocaleString("fr-CA")} $</p>}
                  </div>
                  <Button variant="ghost" size="sm" className="text-white hover:text-gold hover:bg-transparent p-0">
                    Voir le tour <ChevronRight className="size-4 ms-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </a>
  );
};

export default LandToursCard;