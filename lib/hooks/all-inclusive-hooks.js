"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AI_API as API } from "@/lib/constants/all-inclusive-constants";
import { jsDateToConst } from "@/lib/helpers/all-inclusive-helpers";

export function useSearch() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [fetched, setFetched] = useState(false);
  const abortRef = useRef(null);

  const execute = useCallback(async (params) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);

    const qs = new URLSearchParams({
      orig:       params.orig,
      dest:       params.dest,
      dep:        jsDateToConst(params.dep),
      flex:       params.flex,
      n:          params.n,
      toutinclus: "1",
    });
    if (params.etoiles?.length)  qs.set("etoiles",  params.etoiles.join(","));
    if (params.prixMin)          qs.set("prix_min", params.prixMin);
    if (params.prixMax)          qs.set("prix_max", params.prixMax);

    try {
      const res  = await fetch(`${API}/search?${qs}`, { signal: abortRef.current.signal });
      const json = await res.json();
      setData(json.success ? json.data : []);
      setFetched(true);
    } catch (e) {
      if (e.name !== "AbortError") setError("Impossible de charger les forfaits.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetched, execute };
}

// ─── Hook données statiques ───────────────────────────────────────────────────

export function useStaticData() {
  const [destinations, setDestinations] = useState([]);
  const [origines,     setOrigines]     = useState([]);

  useEffect(() => {
    fetch(`${API}/destinations`).then(r => r.json()).then(setDestinations).catch(() => {});
    fetch(`${API}/origines`).then(r => r.json()).then(setOrigines).catch(() => {});
  }, []);

  return { destinations, origines };
}