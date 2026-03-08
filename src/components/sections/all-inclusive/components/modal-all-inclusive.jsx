import { useState, useEffect, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { Loader2, X, MapPin, ChevronLeft, ChevronRight, Send, Mail } from "lucide-react";
import { GOLD, AI_API as API } from "@/lib/constants/all-inclusive-constants";
import { renderStars } from "@/lib/helpers/all-inclusive-helpers";
import emailjs from "@emailjs/browser";
import clsx from "clsx";

const SLIDESHOW_INTERVAL = 4000;

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = "template_allinclusive";
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const ModalAllInclusive = ({ forfait, onClose }) => {
  const [detail,        setDetail]        = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [activeIdx,     setActiveIdx]     = useState(0);
  const [lightbox,      setLightbox]      = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // ── Formulaire ──
  const [showForm,    setShowForm]    = useState(false);
  const [nom,         setNom]         = useState("");
  const [email,       setEmail]       = useState("");
  const [message,     setMessage]     = useState("");
  const [statut,      setStatut]      = useState(null); // "sending" | "success" | "error"
  // ── Voyageurs ──
  const [nbAdultes,   setNbAdultes]   = useState(2);
  const [nbChambres,  setNbChambres]  = useState(1);
  const [agesEnfants, setAgesEnfants] = useState([]); // tableau d'âges (string)

  const intervalRef = useRef(null);

  // ── Fetch détail ──
  useEffect(() => {
    setLoading(true);
    fetch(`${API}/detail?token=${forfait.token}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setDetail(json.data);
        else setError("Impossible de charger le détail.");
      })
      .catch(() => setError("Erreur réseau."))
      .finally(() => setLoading(false));
  }, [forfait.token]);

  // Images disponibles
  const images = detail?.images?.length > 0 ? detail.images : [forfait.image].filter(Boolean);

  // ── Slideshow auto ──
  const goTo = (idx, wrap = true) => {
    if (images.length <= 1) return;
    const next = wrap ? (idx + images.length) % images.length : idx;
    setTransitioning(true);
    setTimeout(() => {
      setActiveIdx(next);
      setTransitioning(false);
    }, 250);
  };

  useEffect(() => {
    if (lightbox || images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      goTo(activeIdx + 1);
    }, SLIDESHOW_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [activeIdx, images.length, lightbox]);

  const pauseAndGo = (idx) => {
    clearInterval(intervalRef.current);
    goTo(idx, false);
  };

  // ── Helpers enfants ──
  const ajouterEnfant  = () => setAgesEnfants(a => [...a, ""]);
  const retirerEnfant  = (i) => setAgesEnfants(a => a.filter((_, idx) => idx !== i));
  const setAgeEnfant   = (i, val) => setAgesEnfants(a => a.map((age, idx) => idx === i ? val : age));

  // ── Envoi courriel ──
  async function handleEnvoyer() {
    if (!nom.trim() || !email.trim()) return;
    setStatut("sending");

    const opt = selectedOption;

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          nom_client:    nom,
          email_client:  email,
          message:       message || "Aucun message supplémentaire.",
          // Infos forfait
          hotel:         forfait.nom,
          region:        forfait.region,
          // Infos voyageurs
          nb_adultes:    nbAdultes,
          nb_chambres:   nbChambres,
          enfants:       agesEnfants.length > 0
            ? `${agesEnfants.length} enfant(s) — âges : ${agesEnfants.map(a => a || "?").join(", ")} ans`
            : "Aucun enfant",
          compagnie:     opt?.compagnie      ?? "—",
          prix:          opt?.prix?.toLocaleString("fr-CA") ?? detail?.prix_min?.toLocaleString("fr-CA") ?? "—",
          vol_aller:     opt
            ? `${opt.vol_aller.date} : ${opt.vol_aller.origine} ${opt.vol_aller.depart} → ${opt.vol_aller.arrivee} ${opt.vol_aller.destination}`
            : "—",
          vol_retour:    opt
            ? `${opt.vol_retour.date} : ${opt.vol_retour.origine} ${opt.vol_retour.depart} → ${opt.vol_retour.arrivee} ${opt.vol_retour.destination}`
            : "—",
        },
        EMAILJS_PUBLIC_KEY,
      );
      setStatut("success");
    } catch {
      setStatut("error");
    }
  }

  return (
    <>
      {/* ── Modal principal ── */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <div
          className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.3)" }}
          onClick={e => e.stopPropagation()}
        >

          {/* ── Header slideshow ── */}
          <div
            className="relative h-56 overflow-hidden cursor-zoom-in"
            onClick={() => !showForm && setLightbox(true)}
          >
            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{ opacity: transitioning ? 0 : 1 }}
            >
              <img src={images[activeIdx]} alt="" className="w-full h-full object-cover" />
            </div>

            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.08) 100%)" }}
            />

            <button
              onClick={e => { e.stopPropagation(); onClose(); }}
              className="absolute top-4 right-4 z-10 p-1.5 hover:opacity-70 transition-opacity"
              style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}
            >
              <X className="size-4 text-white" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); pauseAndGo((activeIdx - 1 + images.length) % images.length); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-1 hover:opacity-80 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}
                >
                  <ChevronLeft className="size-4 text-white" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); pauseAndGo((activeIdx + 1) % images.length); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1 hover:opacity-80 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}
                >
                  <ChevronRight className="size-4 text-white" />
                </button>
              </>
            )}

            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 pointer-events-none">
              {detail && <div className="mb-1.5">{renderStars(detail.etoiles)}</div>}
              <h3 className="font-serif text-2xl text-white leading-tight">{forfait.nom}</h3>
              <p className="text-xs text-white/70 flex items-center gap-1 mt-1">
                <MapPin className="size-3" />{forfait.region}
              </p>
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-1.5 pointer-events-auto">
                {images.slice(0, 7).map((_, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); pauseAndGo(i); }}
                    className="transition-all duration-200"
                    style={{
                      width:  activeIdx === i ? 16 : 6,
                      height: 6,
                      borderRadius: 3,
                      background: activeIdx === i ? GOLD : "rgba(255,255,255,0.5)",
                    }}
                  />
                ))}
              </div>
            )}

            {images.length > 1 && !lightbox && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 pointer-events-none">
                <div
                  key={activeIdx}
                  className="h-full bg-white/40"
                  style={{ animation: `slideProgress ${SLIDESHOW_INTERVAL}ms linear` }}
                />
              </div>
            )}
          </div>

          {/* ── Corps ── */}
          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-7 animate-spin text-stone-300" />
              </div>
            )}
            {error && <p className="text-red-400 text-sm text-center py-8">{error}</p>}

            {detail && !showForm && (
              <div className="space-y-6">

                {/* Infos hôtel */}
                {Object.keys(detail.infos).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {Object.entries(detail.infos).map(([titre, items]) => (
                      <div key={titre}>
                        <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: GOLD }}>{titre}</p>
                        <ul className="space-y-0.5">
                          {items.map((item, i) => (
                            <li key={i} className="text-xs text-stone-600 flex items-start gap-1.5">
                              <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-stone-300" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Types de chambre */}
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: GOLD }}>
                    Chambres & disponibilités
                  </p>
                  {detail.types_chambres.map((tc, i) => (
                    <div key={i} className="border border-stone-100 overflow-hidden shadow-sm">
                      <div className="px-4 py-2.5 bg-stone-200 border-2 border-stone-200 flex items-center justify-between">
                        <p className="text-sm font-medium text-stone-800 w-fit">{tc.nom}</p>
                        <span className="text-xs text-stone-600">
                          à partir de {tc.prix_depart?.toLocaleString("fr-CA")} $
                        </span>
                      </div>
                      <div className="divide-y divide-stone-50">
                        {tc.options.slice(0, 5).map((opt, j) => (
                          <div
                            key={j}
                            onClick={() => setSelectedOption(opt)}
                            className={clsx(
                              "cursor-pointer px-4 py-2.5 grid grid-cols-1 md:grid-cols-12 flex items-start justify-start w-full gap-4 border-stone-100 hover:bg-stone-100 transition-colors",
                              j % 2 !== 0 && "bg-stone-50",
                              selectedOption === opt && "ring-2 ring-inset"
                            )}
                            style={selectedOption === opt ? { "--tw-ring-color": GOLD } : {}}
                          >
                            <div
                              className="col-span-2 text-[10px] font-medium px-2 py-0.5 w-fit"
                              style={{ background: "rgba(184,147,92,0.08)", color: GOLD, border: `1px solid rgba(184,147,92,0.15)` }}
                            >
                              {opt.compagnie}
                            </div>
                            <div className="col-span-8 flex flex-col items-center gap-3 min-w-0">
                              <p className="text-xs text-stone-500 min-w-0 truncate">
                                <span className="font-medium text-stone-700">{opt.vol_aller.date}</span>
                                {" : "}
                                {opt.vol_aller.origine}{" "}{opt.vol_aller.depart} → {opt.vol_aller.arrivee}{" "}{opt.vol_aller.destination}
                              </p>
                              <p className="text-xs text-stone-500 min-w-0 truncate">
                                <span className="font-medium text-stone-700">{opt.vol_retour.date}</span>
                                {" : "}
                                {opt.vol_retour.origine}{" "}{opt.vol_retour.depart} → {opt.vol_retour.arrivee}{" "}{opt.vol_retour.destination}
                              </p>
                            </div>
                            <p className="col-span-2 text-sm font-bold text-stone-900 flex justify-end items-center">
                              {opt.prix?.toLocaleString("fr-CA")} $
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div
                  className="p-4 flex items-center justify-between gap-4"
                  style={{ background: "#F5F2EB", border: `1px solid rgba(184,147,92,0.15)` }}
                >
                  <div>
                    <p className="text-xs text-stone-500">À partir de</p>
                    <p className="text-2xl font-bold text-stone-900">
                      {selectedOption ? selectedOption.prix?.toLocaleString("fr-CA") : detail.prix_min?.toLocaleString("fr-CA")} $
                    </p>
                    <p className="text-[10px] text-stone-400">par personne, taxes incluses</p>
                  </div>
                  <button
                    className="px-6 py-3 text-xs font-semibold tracking-widest uppercase text-white transition-opacity hover:opacity-90 flex items-center gap-2"
                    style={{ background: GOLD }}
                    onClick={() => setShowForm(true)}
                  >
                    <Mail className="size-4" />
                    Demander un devis
                  </button>
                </div>
              </div>
            )}

            {/* ── Formulaire ── */}
            {detail && showForm && (
              <div className="space-y-5">

                {/* Récap option */}
                <div
                  className="p-3 flex items-start gap-3"
                  style={{ background: "#F5F2EB", border: `1px solid rgba(184,147,92,0.15)` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: GOLD }}>
                      Forfait sélectionné
                    </p>
                    <p className="text-sm font-medium text-stone-800">{forfait.nom}</p>
                    {selectedOption ? (
                      <div className="mt-1 space-y-0.5">
                        <p className="text-xs text-stone-500">
                          {selectedOption.compagnie} · {selectedOption.prix?.toLocaleString("fr-CA")} $ / personne
                        </p>
                        <p className="text-xs text-stone-400 truncate">
                          ✈ {selectedOption.vol_aller.date} · {selectedOption.vol_aller.origine} → {selectedOption.vol_aller.destination}
                        </p>
                        <p className="text-xs text-stone-400 truncate">
                          ✈ {selectedOption.vol_retour.date} · {selectedOption.vol_retour.origine} → {selectedOption.vol_retour.destination}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-stone-400 mt-1">
                        À partir de {detail.prix_min?.toLocaleString("fr-CA")} $ · Aucune option spécifique sélectionnée
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-xs text-stone-400 hover:text-stone-600 transition-colors shrink-0 underline underline-offset-2"
                  >
                    Modifier
                  </button>
                </div>

                {statut === "success" ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="size-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                      <Send className="size-6 text-green-600" />
                    </div>
                    <p className="font-semibold text-stone-800">Demande envoyée !</p>
                    <p className="text-sm text-stone-500">Nous vous répondrons dans les plus brefs délais.</p>
                    <button
                      onClick={onClose}
                      className="cursor-pointer mt-4 text-sm font-medium transition-all duration-300 hover:opacity-70"
                      style={{ color: GOLD }}
                    >
                      Fermer
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {/* ── Voyageurs ── */}
                      <div>
                        <p className="text-[10px] text-stone-400 tracking-[0.15em] uppercase mb-2">Voyageurs</p>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Adultes */}
                          <div>
                            <label className="text-[10px] text-stone-400 tracking-[0.12em] uppercase mb-1.5 block">Adultes</label>
                            <div className="flex items-center border border-stone-200 bg-stone-50">
                              <button
                                type="button"
                                onClick={() => setNbAdultes(n => Math.max(1, n - 1))}
                                className="px-3 py-2.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors text-base font-medium"
                              >−</button>
                              <span className="flex-1 text-center text-sm font-semibold text-stone-800">{nbAdultes}</span>
                              <button
                                type="button"
                                onClick={() => setNbAdultes(n => Math.min(10, n + 1))}
                                className="px-3 py-2.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors text-base font-medium"
                              >+</button>
                            </div>
                          </div>
                          {/* Chambres */}
                          <div>
                            <label className="text-[10px] text-stone-400 tracking-[0.12em] uppercase mb-1.5 block">Chambres</label>
                            <div className="flex items-center border border-stone-200 bg-stone-50">
                              <button
                                type="button"
                                onClick={() => setNbChambres(n => Math.max(1, n - 1))}
                                className="px-3 py-2.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors text-base font-medium"
                              >−</button>
                              <span className="flex-1 text-center text-sm font-semibold text-stone-800">{nbChambres}</span>
                              <button
                                type="button"
                                onClick={() => setNbChambres(n => Math.min(10, n + 1))}
                                className="px-3 py-2.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors text-base font-medium"
                              >+</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── Enfants ── */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[10px] text-stone-400 tracking-[0.15em] uppercase">
                            Enfants{agesEnfants.length > 0 ? ` (${agesEnfants.length})` : ""}
                          </label>
                          <button
                            type="button"
                            onClick={ajouterEnfant}
                            className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 transition-colors"
                            style={{ color: GOLD, border: `1px solid rgba(184,147,92,0.3)`, background: "rgba(184,147,92,0.06)" }}
                          >
                            + Ajouter
                          </button>
                        </div>
                        {agesEnfants.length === 0 ? (
                          <p className="text-xs text-stone-400 italic">Aucun enfant</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {agesEnfants.map((age, i) => (
                              <div key={i} className="flex items-center gap-1 border border-stone-200 bg-stone-50 pl-3 pr-1 py-1">
                                <span className="text-[10px] text-stone-400 uppercase tracking-wider shrink-0">Enfant {i + 1} :</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="17"
                                  value={age}
                                  onChange={e => setAgeEnfant(i, e.target.value)}
                                  placeholder="âge"
                                  className="w-12 text-center text-sm font-semibold text-stone-800 bg-transparent focus:outline-none"
                                />
                                <span className="text-[10px] text-stone-400">ans</span>
                                <button
                                  type="button"
                                  onClick={() => retirerEnfant(i)}
                                  className="ml-1 p-1 text-stone-400 hover:text-red-400 transition-colors"
                                >
                                  <X className="size-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div>
                        <label className="text-[10px] text-stone-400 tracking-[0.15em] uppercase mb-1.5 block">Votre nom*</label>
                        <input
                          type="text"
                          value={nom}
                          onChange={e => setNom(e.target.value)}
                          placeholder="Jean Tremblay"
                          className="w-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:border-transparent"
                          style={{ "--tw-ring-color": `${GOLD}4D` }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-400 tracking-[0.15em] uppercase mb-1.5 block">Votre courriel*</label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="jean@exemple.com"
                          className="w-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:border-transparent"
                          style={{ "--tw-ring-color": `${GOLD}4D` }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-400 tracking-[0.15em] uppercase mb-1.5 block">Message (optionnel)</label>
                        <textarea
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          placeholder="Questions, préférences de chambre, besoins particuliers..."
                          rows={3}
                          className="w-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                          style={{ "--tw-ring-color": `${GOLD}4D` }}
                        />
                      </div>
                    </div>

                    {statut === "error" && (
                      <p className="text-xs text-red-500 text-center">Une erreur est survenue. Veuillez réessayer.</p>
                    )}

                    <button
                      onClick={handleEnvoyer}
                      disabled={!nom.trim() || !email.trim() || statut === "sending"}
                      className="flex w-full items-center justify-center gap-2.5 py-3.5 px-6 font-semibold text-sm text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: GOLD }}
                    >
                      {statut === "sending"
                        ? <Loader2 className="size-5 animate-spin" />
                        : <Send className="size-5" />
                      }
                      {statut === "sending" ? "Envoi en cours..." : "Envoyer la demande"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-5 right-5 p-2 hover:opacity-70 transition-opacity"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <X className="size-5 text-white" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setActiveIdx(i => (i - 1 + images.length) % images.length); }}
                className="absolute left-5 top-1/2 -translate-y-1/2 p-2 hover:opacity-70 transition-opacity"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <ChevronLeft className="size-6 text-white" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setActiveIdx(i => (i + 1) % images.length); }}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:opacity-70 transition-opacity"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <ChevronRight className="size-6 text-white" />
              </button>
            </>
          )}

          <img
            src={images[activeIdx]}
            alt=""
            className="max-w-full max-h-full object-contain"
            style={{ maxWidth: "calc(100vw - 120px)", maxHeight: "calc(100vh - 80px)" }}
            onClick={e => e.stopPropagation()}
          />

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-white/50">
            {activeIdx + 1} / {images.length}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </>
  );
};

export default ModalAllInclusive;