"use client";

import { memo } from "react";
import Image from "next/image";
import { Ship, MapPin, Calendar, ShipIcon, Share2 } from "lucide-react";
import { getPrixMin, fmtPeriode, partagerCroisiere } from "../../../../lib/constants/cruises-constants";

const CarteCroisiere = memo(function CarteCroisiere({ c, onClick }) {
	const prix = getPrixMin(c);

	return (
		<button
			onClick={() => onClick(c)}
			className="card-lift group text-left flex flex-col overflow-hidden bg-white cursor-pointer w-full rounded-2xl"
		>
			{/* ── Image itinéraire (map) — propre, sans miniature ── */}
			<div
				className="relative overflow-hidden"
				style={{ height: "250px" }}
			>
				<Image
					src={c["Image Itinéraire"]}
					alt={c["Itinéraire"]}
					fill
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
					className="object-cover transition-transform duration-700 group-hover:scale-105"
					onError={(e) => {
						e.target.style.display = "none";
					}}
				/>
				<div
					className="absolute inset-0"
					style={{
						background: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.08) 15%, transparent 100%)",
					}}
				/>

				{/* Badge compagnie — haut gauche */}
				<div
					className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-white text-xs font-semibold tracking-wide"
					style={{
						background: "rgba(0,0,0,0.35)",
						backdropFilter: "blur(12px)",
						border: "1px solid rgba(255,255,255,0.15)",
					}}
				>
					{c["Croisiériste"]}
				</div>

				{/* Badge nuits — haut droit */}
				<div
					className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-white text-xs font-bold"
					style={{
						background: "rgba(0,0,0,0.35)",
						backdropFilter: "blur(12px)",
						border: "1px solid rgba(255,255,255,0.15)",
					}}
				>
					{c["Nuits"]} nuits
				</div>
			</div>

			{/* ── Corps ── */}
			<div className="relative flex flex-col flex-1 py-4 px-5 gap-4">
				{/* Titre + image navire côte à côte */}
				<div className=" flex items-start justify-between gap-3">
					<div className="min-w-0">
						<h3 className="font-serif text-xl mb-1 leading-tight text-stone-900 group-hover:text-gold transition-colors duration-300">
							{c["Itinéraire"]}
						</h3>
						{/* Infos départ */}
						<div className=" flex flex-col gap-0.5">
							{/* NAVIRE */}
							<p className="flex items-center gap-2 text-xs text-stone-500">
								<ShipIcon className="size-3.5 shrink-0" />
								{c["Navire"]}
							</p>
							{/* DATES */}
							<p className="flex items-center gap-2 text-xs text-stone-500 ">
								<Calendar className="size-3.5 shrink-0 mb-1 text-stone-400" />
								<span>{fmtPeriode(c["Date Départ"], c["Date Retour"])}</span>
							</p>

							{/* PORT DE DÉPART */}
							{c["Port Départ"] && c["Port Départ"] !== "N/A" && (
								<p className="flex items-center gap-2 text-xs text-stone-500">
									<MapPin className="size-3.5 mb-0.5 shrink-0" />
									<span>{c["Port Départ"]}</span>
								</p>
							)}
						</div>
					</div>

					{/* Image navire */}
					{c["Image Navire"] && (
						<div
							className="relative shrink-0 overflow-hidden rounded-lg border-[1.5px] border-gold/25 shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
							style={{ width: 120, height: 78 }}
						>
							<Image
								src={c["Image Navire"]}
								alt={c["Navire"]}
								fill
								sizes="120px"
								className="object-cover"
								onError={(e) => {
									e.target.parentElement.style.display = "none";
								}}
							/>
						</div>
					)}
				</div>

				{/* Séparateur doré */}
				<div className="h-px w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

				{/* Prix + pills */}
				<div className="flex items-end justify-between gap-2">
					<div>
						<p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1 text-gold/60">À partir de</p>
						<div className="flex items-baseline gap-1">
							<span className="text-2xl font-bold text-stone-900">{prix.toLocaleString("fr-CA")} $</span>
							<span className="text-xs text-stone-400">/ pers.</span>
						</div>
					</div>

					<div className="flex flex-wrap gap-1 justify-end">
						{c["Prix Int."] > 0 && (
							<span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gold/[0.07] text-gold/80 border border-gold/15">
								Int. {c["Prix Int."].toLocaleString("fr-CA")} $
							</span>
						)}
						{c["Prix Ext."] > 0 && (
							<span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gold/[0.07] text-gold/80 border border-gold/15">
								Ext. {c["Prix Ext."].toLocaleString("fr-CA")} $
							</span>
						)}
						{c["Prix Balcon"] > 0 && (
							<span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gold/[0.07] text-gold/80 border border-gold/15">
								Bal. {c["Prix Balcon"].toLocaleString("fr-CA")} $
							</span>
						)}
					</div>
				</div>
			</div>
		</button>
	);
});

export default CarteCroisiere;
