import { Globe, Plane, Mountain } from "lucide-react";

export const REGION_LABELS = {
  africa:  "Afrique",
  america: "Amériques",
  asia:    "Asie",
  europe:  "Europe",
  oceania: "Océanie",
};

export const VISIBLE_COUNT = 6;

export const SOURCES = [
  { id: "exoticca", label: "Exoticca",           icon: Globe,    endpoint: "/api/circuits/exoticca" },
  { id: "acv",      label: "Air Canada Vacances", icon: Plane,    endpoint: "/api/circuits/acv"      },
  { id: "tripoppo", label: "Tripoppo",            icon: Mountain, endpoint: "/api/circuits/tripoppo" },
];

export const TRI_OPTIONS = [
  { value: "prix-asc",   label: "Prix croissant"     },
  { value: "prix-desc",  label: "Prix décroissant"   },
  { value: "mois-asc",   label: "Date croissante"    },
  { value: "mois-desc",  label: "Date décroissante"  },
  { value: "duree-asc",  label: "Durée croissante"   },
  { value: "duree-desc", label: "Durée décroissante" },
];