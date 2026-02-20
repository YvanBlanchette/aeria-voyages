import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";

// ── CONFIG EMAILJS — À remplacer avec vos vraies clés ─────────────────────────
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

const GOLD = "#B8935C";
const GOLD_LIGHT = "#D4AA7D";

// ── DONNÉES ───────────────────────────────────────────────────────────────────
const TYPES_VOYAGE = [
  { value: "croisiere", label: "🚢 Croisière" },
  { value: "tout-inclus", label: "🌴 Tout-inclus" },
  { value: "circuit", label: "🗺️ Circuit terrestre" },
  { value: "sur-mesure", label: "✨ Sur mesure" },
];

const BUDGETS = [
  { value: "1000-2000", label: "1 000 $ – 2 000 $" },
  { value: "2000-4000", label: "2 000 $ – 4 000 $" },
  { value: "4000-7000", label: "4 000 $ – 7 000 $" },
  { value: "7000-10000", label: "7 000 $ – 10 000 $" },
  { value: "10000+", label: "10 000 $ et plus" },
];

const TYPES_CROISIERE = [
  { value: "maritime", label: "Maritime" },
  { value: "fluviale", label: "Fluviale" },
  { value: "expedition", label: "Expédition" },
];

const TYPES_CABINE = [
  { value: "interieure", label: "Intérieure" },
  { value: "vue-mer", label: "Vue mer" },
  { value: "balcon", label: "Balcon" },
  { value: "suite", label: "Suite" },
];

const CATEGORIES_HOTEL = [
  { value: "3", label: "⭐⭐⭐ Confort" },
  { value: "4", label: "⭐⭐⭐⭐ Supérieur" },
  { value: "5", label: "⭐⭐⭐⭐⭐ Luxe" },
  { value: "boutique", label: "🏡 Boutique / Charme" },
];

const EXPERIENCES = [
  "Gastronomie & Vins",
  "Aventure & Nature",
  "Culture & Histoire",
  "Plage & Détente",
  "Romance & Lune de miel",
  "Famille & Enfants",
  "Spa & Bien-être",
  "Vie nocturne",
];

// ── COMPOSANTS UI ─────────────────────────────────────────────────────────────
function GoldInput({ label, required, error, children, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#8B7355",
        fontWeight: 500,
      }}>
        {label} {required && <span style={{ color: GOLD }}>*</span>}
      </label>
      {children}
      {hint && !error && <span style={{ fontSize: 11, color: "#A89070" }}>{hint}</span>}
      {error && (
        <span style={{ fontSize: 11, color: "#C0392B", display: "flex", alignItems: "center", gap: 4 }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
}

const inputStyle = (error) => ({
  width: "100%",
  padding: "12px 16px",
  background: "rgba(255,255,255,0.6)",
  border: `1px solid ${error ? "#C0392B" : "rgba(184,147,92,0.3)"}`,
  borderRadius: 2,
  fontSize: 14,
  color: "#3D2E1E",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  fontFamily: "inherit",
  boxSizing: "border-box",
});

function Input({ label, required, error, hint, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <GoldInput label={label} required={required} error={error} hint={hint}>
      <input
        {...props}
        style={{
          ...inputStyle(error),
          borderColor: focused ? GOLD : (error ? "#C0392B" : "rgba(184,147,92,0.3)"),
          boxShadow: focused ? `0 0 0 3px rgba(184,147,92,0.15)` : "none",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </GoldInput>
  );
}

function Select({ label, required, error, children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <GoldInput label={label} required={required} error={error}>
      <div style={{ position: "relative" }}>
        <select
          {...props}
          style={{
            ...inputStyle(error),
            appearance: "none",
            cursor: "pointer",
            borderColor: focused ? GOLD : (error ? "#C0392B" : "rgba(184,147,92,0.3)"),
            boxShadow: focused ? `0 0 0 3px rgba(184,147,92,0.15)` : "none",
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          {children}
        </select>
        <span style={{
          position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
          pointerEvents: "none", color: GOLD, fontSize: 12,
        }}>▾</span>
      </div>
    </GoldInput>
  );
}

function Textarea({ label, required, error, hint, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <GoldInput label={label} required={required} error={error} hint={hint}>
      <textarea
        {...props}
        style={{
          ...inputStyle(error),
          resize: "vertical",
          minHeight: 120,
          lineHeight: 1.6,
          borderColor: focused ? GOLD : (error ? "#C0392B" : "rgba(184,147,92,0.3)"),
          boxShadow: focused ? `0 0 0 3px rgba(184,147,92,0.15)` : "none",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </GoldInput>
  );
}

function ChipGroup({ options, selected, onChange, multi = false }) {
  const toggle = (val) => {
    if (multi) {
      onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
    } else {
      onChange(val === selected ? "" : val);
    }
  };
  const isSelected = (val) => multi ? selected.includes(val) : selected === val;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => (
        <button
          key={opt.value || opt}
          type="button"
          onClick={() => toggle(opt.value || opt)}
          style={{
            padding: "8px 16px",
            border: `1px solid ${isSelected(opt.value || opt) ? GOLD : "rgba(184,147,92,0.3)"}`,
            borderRadius: 2,
            background: isSelected(opt.value || opt) ? `rgba(184,147,92,0.15)` : "rgba(255,255,255,0.5)",
            color: isSelected(opt.value || opt) ? "#6B4F2A" : "#8B7355",
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "inherit",
            fontWeight: isSelected(opt.value || opt) ? 500 : 400,
          }}
        >
          {opt.label || opt}
        </button>
      ))}
    </div>
  );
}

// ── ÉTAPES ────────────────────────────────────────────────────────────────────
const ETAPES = [
  { num: 1, label: "Vous" },
  { num: 2, label: "Le voyage" },
  { num: 3, label: "Détails" },
  { num: 4, label: "Rêves" },
];

// ── FORMULAIRE PRINCIPAL ──────────────────────────────────────────────────────
export default function SubmissionRequest() {
  const [etape, setEtape] = useState(1);
  const [envoi, setEnvoi] = useState("idle"); // idle | loading | success | error
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    // Étape 1
    prenom: "", nom: "", email: "", telephone: "", adresse: "",
    // Étape 2
    typeVoyage: "", dateDepart: "", dateRetour: "", datesFlexibles: false,
    adultes: 2, enfants: 0, agesEnfants: "", budget: "",
    // Étape 3 — Croisière
    typeCroisiere: "", typeCabine: "",
    // Étape 3 — Tout-inclus
    categorieHotel: "", proximitePlage: "",
    // Étape 3 — Circuit
    typeCircuit: "",
    // Étape 4
    destinations: "", experiences: [], requestsSpeciales: "", commentDecouvert: "",
  });

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const valider = () => {
    const errs = {};
    if (etape === 1) {
      if (!form.prenom.trim()) errs.prenom = "Requis";
      if (!form.nom.trim()) errs.nom = "Requis";
      if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Format invalide";
      if (!form.telephone.match(/^[\d\s\-\+\(\)]{10,}$/)) errs.telephone = "Format invalide";
    }
    if (etape === 2) {
      if (!form.typeVoyage) errs.typeVoyage = "Veuillez choisir un type de voyage";
      if (!form.dateDepart) errs.dateDepart = "Requis";
      if (!form.budget) errs.budget = "Requis";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const suivant = () => {
    if (valider()) setEtape(e => Math.min(e + 1, 4));
  };
  const precedent = () => setEtape(e => Math.max(e - 1, 1));

  // ── Envoi EmailJS ──────────────────────────────────────────────────────────
  const soumettre = async () => {
    if (!valider()) return;
    setEnvoi("loading");

    const templateParams = {
      prenom: form.prenom,
      nom: form.nom,
      email: form.email,
      telephone: form.telephone,
      adresse: form.adresse || "Non fournie",
      type_voyage: TYPES_VOYAGE.find(t => t.value === form.typeVoyage)?.label || form.typeVoyage,
      date_depart: form.dateDepart,
      date_retour: form.dateRetour || "Non précisée",
      dates_flexibles: form.datesFlexibles ? "Oui" : "Non",
      adultes: form.adultes,
      enfants: form.enfants,
      ages_enfants: form.agesEnfants || "N/A",
      budget: BUDGETS.find(b => b.value === form.budget)?.label || form.budget,
      // Spécifiques
      type_croisiere: form.typeCroisiere || "N/A",
      type_cabine: form.typeCabine || "N/A",
      categorie_hotel: form.categorieHotel || "N/A",
      proximite_plage: form.proximitePlage || "N/A",
      // Rêves
      destinations: form.destinations || "Non précisées",
      experiences: form.experiences.join(", ") || "Non précisées",
      requests_speciales: form.requestsSpeciales || "Aucune",
      comment_decouvert: form.commentDecouvert || "Non précisé",
    };

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      setEnvoi("success");
    } catch {
      setEnvoi("error");
    }
  };

  // ── Rendu succès ───────────────────────────────────────────────────────────
  if (envoi === "success") {
    return (
      <div style={{
        minHeight: "60vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center",
      }}>
        <div style={{ fontSize: 56, marginBottom: 24 }}>✈️</div>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: 36,
          color: "#3D2E1E", fontWeight: 300, marginBottom: 12,
        }}>
          Votre aventure commence ici
        </h2>
        <p style={{ color: "#8B7355", maxWidth: 420, lineHeight: 1.7 }}>
          Merci {form.prenom} ! J'ai bien reçu votre demande et je vous contacterai dans les 24 heures
          pour commencer à tisser votre voyage de rêve.
        </p>
        <div style={{
          marginTop: 32, padding: "16px 32px",
          border: `1px solid rgba(184,147,92,0.4)`,
          color: GOLD, fontSize: 13, letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          À très bientôt ✦
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Cormorant Garamond', serif",
      background: "linear-gradient(135deg, #FAF7F2 0%, #F5F0E8 50%, #EDE5D8 100%)",
      minHeight: "100vh",
      padding: "40px 16px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        input, select, textarea, button { font-family: 'Montserrat', sans-serif; }
        .fade-in { animation: fadeSlideIn 0.4s ease forwards; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .step-content { animation: fadeSlideIn 0.35s ease forwards; }
      `}</style>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* En-tête */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{
            fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase",
            color: GOLD, marginBottom: 12, fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
          }}>
            AERIA VOYAGES
          </p>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 300,
            color: "#3D2E1E", margin: "0 0 12px", lineHeight: 1.2,
          }}>
            Planifiez votre <em style={{ fontStyle: "italic", color: GOLD }}>évasion</em>
          </h1>
          <p style={{
            fontFamily: "'Montserrat', sans-serif", fontSize: 13,
            color: "#8B7355", fontWeight: 300, lineHeight: 1.7, maxWidth: 460, margin: "0 auto",
          }}>
            Partagez vos envies, je m'occupe du reste. Chaque voyage est une histoire unique —
            laissez-moi écrire la vôtre.
          </p>
        </div>

        {/* Indicateur d'étapes */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 48, gap: 0,
        }}>
          {ETAPES.map((e, idx) => (
            <div key={e.num} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: `1.5px solid ${etape >= e.num ? GOLD : "rgba(184,147,92,0.3)"}`,
                  background: etape === e.num ? GOLD : etape > e.num ? "rgba(184,147,92,0.2)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: etape === e.num ? "#fff" : etape > e.num ? GOLD : "#C4A882",
                  fontSize: 13, fontWeight: 500, transition: "all 0.3s",
                  fontFamily: "'Montserrat', sans-serif",
                }}>
                  {etape > e.num ? "✓" : e.num}
                </div>
                <span style={{
                  fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: etape >= e.num ? GOLD : "#C4A882",
                  fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
                }}>
                  {e.label}
                </span>
              </div>
              {idx < ETAPES.length - 1 && (
                <div style={{
                  width: 60, height: 1, margin: "0 8px", marginBottom: 20,
                  background: etape > e.num ? `linear-gradient(90deg, ${GOLD}, rgba(184,147,92,0.3))` : "rgba(184,147,92,0.2)",
                  transition: "background 0.3s",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Carte formulaire */}
        <div style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(184,147,92,0.2)",
          borderRadius: 4,
          padding: "clamp(24px, 5vw, 48px)",
          boxShadow: "0 20px 60px rgba(61,46,30,0.08), 0 4px 16px rgba(184,147,92,0.1)",
        }}>

          {/* ── ÉTAPE 1 : Identification ─────────────────────────────────── */}
          {etape === 1 && (
            <div className="step-content">
              <h2 style={{ fontWeight: 400, fontSize: 26, color: "#3D2E1E", marginTop: 0, marginBottom: 8 }}>
                Faisons connaissance
              </h2>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, color: "#8B7355", marginBottom: 32, fontWeight: 300 }}>
                Ces informations me permettront de vous contacter avec votre proposition personnalisée.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <Input label="Prénom" required value={form.prenom} onChange={e => set("prenom", e.target.value)} error={errors.prenom} placeholder="Marie" />
                <Input label="Nom" required value={form.nom} onChange={e => set("nom", e.target.value)} error={errors.nom} placeholder="Tremblay" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <Input label="Adresse courriel" required type="email" value={form.email} onChange={e => set("email", e.target.value)} error={errors.email} placeholder="marie@exemple.com" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <Input label="Téléphone" required type="tel" value={form.telephone} onChange={e => set("telephone", e.target.value)} error={errors.telephone} placeholder="514 000-0000" />
              </div>
              <div style={{ marginBottom: 8 }}>
                <Input label="Adresse postale" value={form.adresse} onChange={e => set("adresse", e.target.value)} placeholder="Optionnel — utile pour les documents de voyage" hint="Optionnel" />
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : Le voyage ──────────────────────────────────────── */}
          {etape === 2 && (
            <div className="step-content">
              <h2 style={{ fontWeight: 400, fontSize: 26, color: "#3D2E1E", marginTop: 0, marginBottom: 8 }}>
                L'essence du voyage
              </h2>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, color: "#8B7355", marginBottom: 32, fontWeight: 300 }}>
                Quelques grandes lignes pour cibler les meilleures options pour vous.
              </p>

              {/* Type de voyage */}
              <div style={{ marginBottom: 24 }}>
                <GoldInput label="Type de voyage" required error={errors.typeVoyage}>
                  <ChipGroup
                    options={TYPES_VOYAGE}
                    selected={form.typeVoyage}
                    onChange={val => set("typeVoyage", val)}
                  />
                </GoldInput>
              </div>

              {/* Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
                <Input label="Date de départ" required type="date" value={form.dateDepart} onChange={e => set("dateDepart", e.target.value)} error={errors.dateDepart} />
                <Input label="Date de retour" type="date" value={form.dateRetour} onChange={e => set("dateRetour", e.target.value)} hint="Optionnel" />
              </div>
              <label style={{
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 24, cursor: "pointer",
                fontFamily: "'Montserrat', sans-serif", fontSize: 13, color: "#8B7355",
              }}>
                <input
                  type="checkbox"
                  checked={form.datesFlexibles}
                  onChange={e => set("datesFlexibles", e.target.checked)}
                  style={{ accentColor: GOLD, width: 16, height: 16 }}
                />
                Mes dates sont flexibles (±3 jours)
              </label>

              {/* Voyageurs */}
              <div style={{ marginBottom: 24 }}>
                <p style={{
                  fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "#8B7355", fontWeight: 500, marginBottom: 12,
                  fontFamily: "'Montserrat', sans-serif",
                }}>
                  Nombre de voyageurs
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: "#A89070", marginBottom: 8 }}>Adultes (18+)</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {[1,2,3,4,5,6,"6+"].map(n => (
                        <button key={n} type="button" onClick={() => set("adultes", n)} style={{
                          width: 36, height: 36, border: `1px solid ${form.adultes === n ? GOLD : "rgba(184,147,92,0.3)"}`,
                          background: form.adultes === n ? "rgba(184,147,92,0.15)" : "transparent",
                          color: form.adultes === n ? "#6B4F2A" : "#8B7355",
                          cursor: "pointer", fontSize: 13, borderRadius: 2,
                          fontFamily: "'Montserrat', sans-serif", transition: "all 0.2s",
                        }}>{n}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, color: "#A89070", marginBottom: 8 }}>Enfants (- 18 ans)</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {[0,1,2,3,4,5].map(n => (
                        <button key={n} type="button" onClick={() => set("enfants", n)} style={{
                          width: 36, height: 36, border: `1px solid ${form.enfants === n ? GOLD : "rgba(184,147,92,0.3)"}`,
                          background: form.enfants === n ? "rgba(184,147,92,0.15)" : "transparent",
                          color: form.enfants === n ? "#6B4F2A" : "#8B7355",
                          cursor: "pointer", fontSize: 13, borderRadius: 2,
                          fontFamily: "'Montserrat', sans-serif", transition: "all 0.2s",
                        }}>{n}</button>
                      ))}
                    </div>
                  </div>
                </div>
                {form.enfants > 0 && (
                  <div style={{ marginTop: 16 }} className="fade-in">
                    <Input
                      label="Âges des enfants"
                      value={form.agesEnfants}
                      onChange={e => set("agesEnfants", e.target.value)}
                      placeholder="Ex : 4, 8, 12 ans"
                      hint="Séparés par des virgules"
                    />
                  </div>
                )}
              </div>

              {/* Budget */}
              <GoldInput label="Budget approximatif par personne" required error={errors.budget}>
                <ChipGroup
                  options={BUDGETS}
                  selected={form.budget}
                  onChange={val => set("budget", val)}
                />
              </GoldInput>
            </div>
          )}

          {/* ── ÉTAPE 3 : Détails spécifiques ───────────────────────────── */}
          {etape === 3 && (
            <div className="step-content">
              <h2 style={{ fontWeight: 400, fontSize: 26, color: "#3D2E1E", marginTop: 0, marginBottom: 8 }}>
                {form.typeVoyage === "croisiere" && "Votre croisière idéale"}
                {form.typeVoyage === "tout-inclus" && "Votre resort de rêve"}
                {form.typeVoyage === "circuit" && "Votre circuit parfait"}
                {form.typeVoyage === "sur-mesure" && "Votre voyage sur mesure"}
                {!form.typeVoyage && "Détails du voyage"}
              </h2>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, color: "#8B7355", marginBottom: 32, fontWeight: 300 }}>
                Ces précisions me permettront de vous proposer des options vraiment adaptées.
              </p>

              {/* Croisière */}
              {form.typeVoyage === "croisiere" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <GoldInput label="Type de croisière">
                    <ChipGroup options={TYPES_CROISIERE} selected={form.typeCroisiere} onChange={val => set("typeCroisiere", val)} />
                  </GoldInput>
                  <GoldInput label="Type de cabine souhaité">
                    <ChipGroup options={TYPES_CABINE} selected={form.typeCabine} onChange={val => set("typeCabine", val)} />
                  </GoldInput>
                  <Select label="Durée préférée" value={form.dureeCroisiere || ""} onChange={e => set("dureeCroisiere", e.target.value)}>
                    <option value="">Pas de préférence</option>
                    <option value="3-5">3 à 5 nuits — Escapade</option>
                    <option value="6-9">6 à 9 nuits — Découverte</option>
                    <option value="10-14">10 à 14 nuits — Immersion</option>
                    <option value="15+">15 nuits et plus — Grand voyage</option>
                  </Select>
                </div>
              )}

              {/* Tout-inclus */}
              {form.typeVoyage === "tout-inclus" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <GoldInput label="Catégorie d'hôtel">
                    <ChipGroup options={CATEGORIES_HOTEL} selected={form.categorieHotel} onChange={val => set("categorieHotel", val)} />
                  </GoldInput>
                  <GoldInput label="Proximité de la plage">
                    <ChipGroup
                      options={[
                        { value: "plage-privee", label: "Plage privée" },
                        { value: "bord-mer", label: "Bord de mer" },
                        { value: "peu-importe", label: "Peu importe" },
                      ]}
                      selected={form.proximitePlage}
                      onChange={val => set("proximitePlage", val)}
                    />
                  </GoldInput>
                  <GoldInput label="Style de resort">
                    <ChipGroup
                      options={[
                        { value: "familial", label: "Familial & animé" },
                        { value: "adultes", label: "Adultes seulement" },
                        { value: "romantique", label: "Romantique & intime" },
                        { value: "sportif", label: "Sportif & actif" },
                      ]}
                      selected={form.styleResort || ""}
                      onChange={val => set("styleResort", val)}
                    />
                  </GoldInput>
                </div>
              )}

              {/* Circuit */}
              {form.typeVoyage === "circuit" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <GoldInput label="Style de circuit">
                    <ChipGroup
                      options={[
                        { value: "guide", label: "Guidé en groupe" },
                        { value: "semi-guide", label: "Semi-guidé" },
                        { value: "autonome", label: "Autonome" },
                        { value: "prive", label: "Circuit privé" },
                      ]}
                      selected={form.typeCircuit}
                      onChange={val => set("typeCircuit", val)}
                    />
                  </GoldInput>
                  <GoldInput label="Rythme souhaité">
                    <ChipGroup
                      options={[
                        { value: "detente", label: "Détente — 1 destination/jour" },
                        { value: "equilibre", label: "Équilibré" },
                        { value: "intensif", label: "Intensif — Voir beaucoup" },
                      ]}
                      selected={form.rythmeCircuit || ""}
                      onChange={val => set("rythmeCircuit", val)}
                    />
                  </GoldInput>
                </div>
              )}

              {/* Sur mesure */}
              {form.typeVoyage === "sur-mesure" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <GoldInput label="Niveau de confort souhaité">
                    <ChipGroup
                      options={[
                        { value: "comfort", label: "Confort" },
                        { value: "premium", label: "Premium" },
                        { value: "luxe", label: "Luxe" },
                        { value: "ultra-luxe", label: "Ultra-luxe" },
                      ]}
                      selected={form.niveauConfort || ""}
                      onChange={val => set("niveauConfort", val)}
                    />
                  </GoldInput>
                </div>
              )}

              {/* Commun à tous */}
              <div style={{ marginTop: 24 }}>
                <Select label="Depuis quelle ville partez-vous ?" value={form.villeDepart || ""} onChange={e => set("villeDepart", e.target.value)}>
                  <option value="">Sélectionner</option>
                  <option value="YUL">Montréal (YUL)</option>
                  <option value="YQB">Québec (YQB)</option>
                  <option value="YOW">Ottawa (YOW)</option>
                  <option value="YYZ">Toronto (YYZ)</option>
                  <option value="autre">Autre ville</option>
                </Select>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 4 : Rêves & inspirations ──────────────────────────── */}
          {etape === 4 && (
            <div className="step-content">
              <h2 style={{ fontWeight: 400, fontSize: 26, color: "#3D2E1E", marginTop: 0, marginBottom: 8 }}>
                Vos rêves de voyage
              </h2>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, color: "#8B7355", marginBottom: 32, fontWeight: 300 }}>
                C'est la partie la plus importante. Décrivez-moi l'expérience que vous souhaitez vivre.
              </p>

              <div style={{ marginBottom: 24 }}>
                <Textarea
                  label="Destinations & lieux de rêve"
                  value={form.destinations}
                  onChange={e => set("destinations", e.target.value)}
                  placeholder="Ex : J'ai toujours rêvé de voir les aurores boréales en Islande, ou de naviguer dans les fjords norvégiens..."
                  hint="Soyez aussi précis ou vague que vous le souhaitez"
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <GoldInput label="Expériences recherchées">
                  <ChipGroup
                    options={EXPERIENCES}
                    selected={form.experiences}
                    onChange={val => set("experiences", val)}
                    multi={true}
                  />
                </GoldInput>
              </div>

              <div style={{ marginBottom: 24 }}>
                <Textarea
                  label="Demandes spéciales ou besoins particuliers"
                  value={form.requestsSpeciales}
                  onChange={e => set("requestsSpeciales", e.target.value)}
                  placeholder="Ex : Besoins alimentaires, mobilité réduite, anniversaire à souligner, première croisière..."
                  hint="Optionnel — chaque détail compte"
                />
              </div>

              <div>
                <Select label="Comment avez-vous entendu parler d'Aeria Voyages ?" value={form.commentDecouvert} onChange={e => set("commentDecouvert", e.target.value)}>
                  <option value="">Sélectionner</option>
                  <option value="bouche-oreille">Bouche à oreille</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="google">Google</option>
                  <option value="client-fidele">Je suis déjà client(e)</option>
                  <option value="autre">Autre</option>
                </Select>
              </div>
            </div>
          )}

          {/* ── Navigation ───────────────────────────────────────────────── */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: 40, paddingTop: 32,
            borderTop: "1px solid rgba(184,147,92,0.15)",
          }}>
            <button
              type="button"
              onClick={precedent}
              style={{
                padding: "12px 28px",
                background: "transparent",
                border: "1px solid rgba(184,147,92,0.4)",
                color: "#8B7355",
                fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: etape === 1 ? "not-allowed" : "pointer",
                opacity: etape === 1 ? 0 : 1,
                fontFamily: "'Montserrat', sans-serif",
                transition: "all 0.2s",
                borderRadius: 2,
              }}
              disabled={etape === 1}
            >
              ← Retour
            </button>

            <span style={{
              fontFamily: "'Montserrat', sans-serif", fontSize: 11,
              color: "#C4A882", letterSpacing: "0.1em",
            }}>
              {etape} / 4
            </span>

            {etape < 4 ? (
              <button
                type="button"
                onClick={suivant}
                style={{
                  padding: "14px 32px",
                  background: GOLD,
                  border: "none",
                  color: "#fff",
                  fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  borderRadius: 2,
                  boxShadow: "0 4px 20px rgba(184,147,92,0.4)",
                  transition: "all 0.2s",
                }}
              >
                Continuer →
              </button>
            ) : (
              <button
                type="button"
                onClick={soumettre}
                disabled={envoi === "loading"}
                style={{
                  padding: "14px 32px",
                  background: envoi === "loading" ? "#C4A882" : `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                  border: "none",
                  color: "#fff",
                  fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase",
                  cursor: envoi === "loading" ? "wait" : "pointer",
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  borderRadius: 2,
                  boxShadow: "0 4px 20px rgba(184,147,92,0.5)",
                  transition: "all 0.2s",
                }}
              >
                {envoi === "loading" ? "Envoi en cours..." : "✦ Préparer mon évasion"}
              </button>
            )}
          </div>

          {envoi === "error" && (
            <p style={{
              fontFamily: "'Montserrat', sans-serif", fontSize: 13,
              color: "#C0392B", textAlign: "center", marginTop: 16,
            }}>
              Une erreur s'est produite. Veuillez réessayer ou me contacter directement.
            </p>
          )}
        </div>

        {/* Footer */}
        <p style={{
          textAlign: "center", marginTop: 32,
          fontFamily: "'Montserrat', sans-serif", fontSize: 11,
          color: "#C4A882", letterSpacing: "0.1em",
        }}>
          ✦ Vos informations sont confidentielles et ne seront jamais partagées ✦
        </p>
      </div>
    </div>
  );
}