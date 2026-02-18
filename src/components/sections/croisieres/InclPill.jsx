const INCL_CLS = {
	Inclus: "bg-emerald-50 text-emerald-700 border-emerald-200",
	Gratuit: "bg-amber-50 text-amber-700 border-amber-200",
	"Non inclus": "bg-stone-50 text-stone-400 border-stone-200",
};

export default function InclPill({ Icon, label, statut }) {
	return (
		<span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 border font-medium ${INCL_CLS[statut] || INCL_CLS["Non inclus"]}`}>
			<Icon className="size-3" />
			{label}
		</span>
	);
}
