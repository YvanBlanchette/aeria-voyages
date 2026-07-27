
Claude finished the response

Architected blog structure matching existing site aesthetic avec Ghost API
Architected blog structure matching existing site aesthetic avec Ghost API
Le site m'a donné ce qu'il fallait : Next.js App Router avec segment de langue (/fr/...), thème sombre (tous tes logos sont en variante -light), et un motif de section très constant — surtitre en capitales, titre, sous-titre, puis grille de cartes avec badge et méta. J'ai construit la page blogue sur ces mêmes rails.

Je lis d'abord les conventions de design du projet, puis je génère.


Analyzed overlay positioning et planifié structure page blog
Analyzed overlay positioning et planifié structure page blog
Cinq fichiers, plus le guide d'installation.

Ce que j'ai repris de ton site : le surtitre en capitales espacées suivi d'un grand titre display, le filet fin comme séparateur plutôt que des ombres, les badges de catégorie en surimpression sur l'image, la barre de pagination « Précédent / Page X sur Y / Suivant », et l'italique de rigueur sur les citations. La signature visuelle de la page blogue est le filet doré qui se trace de gauche à droite sous chaque carte au survol — une seule idée, appliquée partout, plutôt qu'un effet différent par élément.

Trois choses à faire avant que ça tourne :

Créer l'intégration côté français — GHOST_FR_KEY est encore vide
Ajouter les deux domaines dans remotePatterns de next.config.js, sinon next/image bloque les visuels de Ghost
Ajuster les six variables de couleur en haut de blogue.css
Ces couleurs sont mon inférence : ton site est sombre (tous tes logos sont en variante -light), mais l'outil de récupération me livre le HTML sans la feuille de style, donc je n'ai pas tes valeurs exactes. Colle-moi ton globals.css ou ton tailwind.config et je les remplace pour de bon.

Un détail repéré au passage : le lien « Blogue » de ton en-tête pointe vers blog.aeriavoyages.com, c'est-à-dire ton instance anglaise. Un visiteur francophone y atterrit en anglais. À rediriger vers /${locale}/blogue.

Et une question de fond qui mérite d'être tranchée maintenant : cette page affiche tes articles à l'intérieur de aeriavoyages.com, ce qui est excellent pour le référencement du site principal et pour la conversion — l'appel à l'action vers /submission en fin d'article est là pour ça. En revanche, tes lecteurs perdent Portal, les commentaires et l'inscription à l'infolettre, qui restent sur Ghost. Si l'infolettre compte pour toi, l'alternative est de garder la liste sur ton site mais de renvoyer vers Ghost pour la lecture complète. Dis-moi ce que tu privilégies, l'ajustement est mineur.


Installation
Document · MD 

Page
Code · TSX 

Page
Code · TSX 

Postcard
Code · TSX 

Blogue
Code · CSS 

Ghost
TS 
1785194001121_image.png
1785194014403_image.png
There is a content api, and a custom api.... which is it?


Weighed custom integration superiority over built-in content API
Weighed custom integration superiority over built-in content API
Les deux fonctionnent — ce sont deux façons d'obtenir une clé Content API valide.

Utilise ta custom, « ÆRIA Voyages ». C'est celle que tu as déjà créée, et c'est la bonne pratique : elle est nommée, tu sais à quoi elle sert, et tu peux la révoquer seule le jour où tu changes de site sans casser autre chose. La built-in « Content API » est une clé partagée et générique — pratique pour un test rapide, moins propre pour du code en production.

Clique donc sur ÆRIA Voyages, et tu y verras deux clés :

Clé	Format	Usage
Content API Key	26 caractères hex	✅ celle-ci
Admin API Key	id:secret avec deux-points	à ne jamais exposer
C'est la première qu'il te faut — c'est d'ailleurs le format de celle qui fonctionne déjà (ed1131282c94082d70600ded51).

Ces captures viennent de quelle instance ? Si c'est blog.aeriavoyages.com, tu as déjà ce qu'il faut. Il te reste alors à refaire exactement la même manipulation sur blogue.aeriavoyages.com/ghost/ — même nom d'intégration, clé différente — pour remplir GHOST_FR_KEY.

it is in jsx


Pivoted framework conversion from TypeScript to JSX format
Pivoted framework conversion from TypeScript to JSX format
Pas de problème — je convertis tout en JSX. Le CSS ne bouge pas.


Created 5 files, ran 4 commands, read a file
Created 5 files, ran 4 commands, read a file
Converti. Le CSS est identique, seuls les cinq fichiers de code changent.

Deux ajustements que la conversion a rendus nécessaires :

Un helper toLang() dans lib/ghost.js remplace l'annotation de type qui garantissait auparavant que locale valait bien "fr" ou "en". Sans TypeScript, un /es/blogue inattendu aurait renvoyé undefined et cassé la page — là il retombe simplement sur le français.

Un jsconfig.json est requis pour que les imports @/lib/ghost résolvent. Si ton projet n'a pas d'alias configuré, c'est trois lignes :

json
{ "compilerOptions": { "paths": { "@/*": ["./*"] } } }
Sinon remplace les imports par des chemins relatifs.

Le reste est inchangé : mêmes routes, mêmes classes, même comportement.


Installation
Document · MD 

Page
Code · JSX 

Page
Code · JSX 

Postcard
Code · JSX 

Blogue
Code · CSS 

Ghost
JS 





Claude is AI and can make mistakes. Please double-check responses.


Page · JSX
// app/[locale]/blogue/page.jsx
import Link from "next/link";
import { getPosts, getTags, toLang } from "@/lib/ghost";
import PostCard from "@/components/blog/PostCard";
import "./blogue.css";
 
export const revalidate = 900;
 
const PER_PAGE = 9;
 
const t = {
  fr: {
    eyebrow: "Carnet de route",
    title: "Le Blogue",
    lede: "Récits d'escales, conseils de conseiller et coulisses de la préparation d'un voyage. Ce que je retiens du terrain, pour que vos départs soient plus faciles.",
    all: "Tous les sujets",
    empty: "Aucun article pour le moment. Revenez bientôt.",
    prev: "Précédent",
    next: "Suivant",
    page: "Page",
    of: "sur",
  },
  en: {
    eyebrow: "Field notes",
    title: "The Blog",
    lede: "Port stories, advisor tips, and what goes on behind a well-planned trip. Lessons from the road, so your departures are easier.",
    all: "All topics",
    empty: "No posts yet. Check back soon.",
    prev: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
  },
};
 
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const copy = t[toLang(locale)];
  return {
    title: `${copy.title} | ÆRIA Voyages`,
    description: copy.lede,
    alternates: { canonical: `/${locale}/blogue` },
  };
}
 
export default async function BloguePage({ params, searchParams }) {
  const { locale } = await params;
  const { page: rawPage, tag } = await searchParams;
 
  const lang = toLang(locale);
  const copy = t[lang];
  const page = Math.max(1, Number(rawPage) || 1);
 
  const [{ posts, pagination }, tags] = await Promise.all([
    getPosts(lang, { page, limit: PER_PAGE, tag }),
    getTags(lang),
  ]);
 
  const buildHref = (next) => {
    const qs = new URLSearchParams();
    const nextTag = next.tag ?? tag;
    if (nextTag) qs.set("tag", nextTag);
    if (next.page && next.page > 1) qs.set("page", String(next.page));
    const q = qs.toString();
    return `/${lang}/blogue${q ? `?${q}` : ""}`;
  };
 
  return (
    <main className="aeria-blogue min-h-screen">
      {/* ---------- En-tête ---------- */}
      <header className="mx-auto max-w-6xl px-6 pb-14 pt-24 md:pt-32">
        <p className="aeria-eyebrow">{copy.eyebrow}</p>
        <h1 className="aeria-display mt-4 text-5xl md:text-7xl">{copy.title}</h1>
        <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-[var(--muted)]">
          {copy.lede}
        </p>
      </header>
 
      {/* ---------- Filtres par sujet ---------- */}
      {tags.length > 0 && (
        <nav
          aria-label={copy.all}
          className="mx-auto max-w-6xl overflow-x-auto border-y border-[var(--line)] px-6"
        >
          <ul className="flex min-w-max gap-6 py-4">
            <li>
              <Link
                href={buildHref({ page: 1, tag: "" })}
                aria-current={!tag ? "page" : undefined}
                className={`text-[0.75rem] uppercase tracking-[0.16em] transition-colors ${
                  !tag ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {copy.all}
              </Link>
            </li>
            {tags.map((item) => (
              <li key={item.id}>
                <Link
                  href={buildHref({ page: 1, tag: item.slug })}
                  aria-current={tag === item.slug ? "page" : undefined}
                  className={`text-[0.75rem] uppercase tracking-[0.16em] transition-colors ${
                    tag === item.slug
                      ? "text-[var(--accent)]"
                      : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
 
      {/* ---------- Grille ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        {posts.length === 0 ? (
          <p className="py-24 text-center text-[var(--muted)]">{copy.empty}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                lang={lang}
                featured={i === 0 && page === 1 && !tag}
                priority={i === 0}
              />
            ))}
          </div>
        )}
 
        {/* ---------- Pagination ---------- */}
        {pagination.pages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-16 flex items-center justify-center gap-8 border-t border-[var(--line)] pt-8"
          >
            {page > 1 ? (
              <Link
                href={buildHref({ page: page - 1 })}
                rel="prev"
                className="text-[0.75rem] uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
              >
                ← {copy.prev}
              </Link>
            ) : (
              <span className="text-[0.75rem] uppercase tracking-[0.16em] text-[var(--line)]">
                ← {copy.prev}
              </span>
            )}
 
            <span className="text-[0.75rem] uppercase tracking-[0.16em] text-[var(--muted)]">
              {copy.page} {pagination.page} {copy.of} {pagination.pages}
            </span>
 
            {page < pagination.pages ? (
              <Link
                href={buildHref({ page: page + 1 })}
                rel="next"
                className="text-[0.75rem] uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
              >
                {copy.next} →
              </Link>
            ) : (
              <span className="text-[0.75rem] uppercase tracking-[0.16em] text-[var(--line)]">
                {copy.next} →
              </span>
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
 
