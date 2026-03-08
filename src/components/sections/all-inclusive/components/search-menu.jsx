import { useMemo } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import Select from '@/components/select';
import MultiSelect from '@/components/multi-select';
import {
  AI_NUITS_OPTIONS as NUITS_OPTIONS,
  ETOILES_OPTIONS,
  AI_TRI_OPTIONS,
  AI_FLEX_OPTIONS,
  GOLD,
} from '@/lib/constants/all-inclusive-constants';

const PRIX_OPTIONS = [
  { value: "",          label: "Tous les prix" },
  { value: "0-1000",    label: "Moins de 1 000 $" },
  { value: "1000-1500", label: "1 000 $ – 1 500 $" },
  { value: "1500-2000", label: "1 500 $ – 2 000 $" },
  { value: "2000-2500", label: "2 000 $ – 2 500 $" },
  { value: "2500-3500", label: "2 500 $ – 3 500 $" },
  { value: "3500-9999", label: "3 500 $ et plus" },
];

const REGIONS_PRINCIPALES = [
  { value: "tout-le-sud",            label: "Tout le Sud" },
  { value: "cuba",                   label: "Cuba" },
  { value: "mexique",                label: "Mexique" },
  { value: "republique-dominicaine", label: "Rép. Dominicaine" },
  { value: "jamaique",               label: "Jamaïque" },
  { value: "costa-rica",             label: "Costa Rica" },
  { value: "colombie",               label: "Colombie" },
  { value: "bahamas",                label: "Bahamas" },
];

// Label visible + espace réservé même si vide — garantit l'alignement vertical
const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[10px] font-semibold tracking-widest uppercase text-stone-400 select-none block" style={{ minHeight: "1em" }}>
      {label}
    </span>
    {children}
  </div>
);

const SearchMenu = ({
  orig, setOrig,
  dest, setDest,
  destFilter, setDestFilter,
  dep, setDep,
  flex, setFlex,
  n, setN,
  etoiles, setEtoiles,
  prix, setPrix,
  tri, setTri,
  filtresActifs, reset,
  handleSearch, loading,
  destinations, origines,
  setPage,
  tous,
}) => {

  const origOptions = origines.map(o => ({ value: o.value, label: o.label }));

  const destDisponibles = useMemo(() => {
    if (!tous?.length) return [];
    const uniq = [...new Set(tous.map(f => f.destination).filter(Boolean))];
    return uniq
      .map(val => {
        const found = destinations.find(d => d.value === val);
        return found ? { value: val, label: found.label } : { value: val, label: val };
      })
      .sort((a, b) => a.label.localeCompare(b.label, "fr"));
  }, [tous, destinations]);

  return (
    <div className="mb-8 p-5" style={{ background: "#F5F2EB", border: "1px solid rgba(184,147,92,0.15)" }}>

      {/* ── Ligne 1 — items-end aligne tout sur le bas, le label invisible du bouton réserve la même hauteur ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-5 items-end">

        <Field label="Ville de départ">
          <Select
            value={orig}
            onChange={setOrig}
            options={origOptions.length ? origOptions : [{ value: "montreal", label: "Montréal" }]}
          />
        </Field>

        <Field label="Région">
          <Select
            value={dest[0] || "tout-le-sud"}
            onChange={v => { setDest([v]); setDestFilter([]); setPage(1); }}
            options={REGIONS_PRINCIPALES}
          />
        </Field>

        <Field label="Date de départ">
          <input
            type="date"
            value={dep}
            onChange={e => setDep(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className="w-full text-sm px-4 py-2.5 border border-stone-200 bg-white text-stone-700 focus:outline-none focus:border-[#B8935C] transition-colors cursor-pointer"
          />
        </Field>

        <Field label="Flexibilité">
          <Select value={flex} onChange={setFlex} options={AI_FLEX_OPTIONS} />
        </Field>

        <Field label="Durée">
          <MultiSelect
            placeholder="Choisir..."
            options={NUITS_OPTIONS}
            selected={n}
            onChange={v => { setN(v.slice(-1)); setPage(1); }}
          />
        </Field>

        {/* Label vide mais présent — réserve la même hauteur que les autres Field */}
        <Field label="​">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="h-[41.6px]  cursor-pointer w-full flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase text-white transition-colors disabled:opacity-50 py-2.5 px-4"
            style={{ background: GOLD }}
          >
            {loading
              ? <Loader2 className="size-3.5 animate-spin shrink-0" />
              : <Search className="size-3.5 shrink-0" />
            }
            <span>Rechercher</span>
          </button>
        </Field>

      </div>

      {/* ── Séparateur ── */}
      <div className="border-t border-stone-200 mb-4" />

      {/* ── Ligne 2 — filtres côté client ── */}
      <div className="grid grid-cols-2 md:grid-cols-4">

        <Field label="Destination">
          <div className={destDisponibles.length === 0 ? "opacity-40 pointer-events-none" : ""}>
            <MultiSelect
              placeholder={destDisponibles.length === 0 ? "Lancez une recherche" : `Toutes (${destDisponibles.length})`}
              options={destDisponibles}
              selected={destFilter}
              onChange={v => { setDestFilter(v); setPage(1); }}
            />
          </div>
        </Field>

        <Field label="Catégorie">
          <MultiSelect
            placeholder="Toutes les étoiles"
            options={ETOILES_OPTIONS}
            selected={etoiles}
            onChange={v => { setEtoiles(v); setPage(1); }}
          />
        </Field>

        <Field label="Budget">
          <Select
            value={prix}
            onChange={v => { setPrix(v); setPage(1); }}
            options={PRIX_OPTIONS}
          />
        </Field>

        <Field label="Trier par">
          <div className="flex flex-col items-end gap-2 w-full">
            <div className="flex-1 w-full">
              <Select
                value={tri}
                onChange={v => { setTri(v); setPage(1); }}
                options={AI_TRI_OPTIONS}
              />
            </div>
            {filtresActifs && (
              <button
                onClick={reset}
                className="shrink-0 flex justify-end items-center gap-1 text-xs font-medium hover:opacity-70 transition-opacity whitespace-nowrap pb-0.5"
                style={{ color: GOLD }}
              >
                <X className="size-3" />
                Réinitialiser
              </button>
            )}
          </div>
        </Field>

      </div>
    </div>
  );
};

export default SearchMenu;