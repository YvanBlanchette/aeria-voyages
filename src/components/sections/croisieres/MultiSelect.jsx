import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { GOLD } from "./constants";

export default function MultiSelect({ placeholder, options, selected, onChange }) {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		const close = (e) => {
			if (!ref.current?.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, []);

	const toggle = useCallback(
		(val) => {
			const opt = options.find((o) => o.value === val);
			if (opt?.disabled) return;
			onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
		},
		[selected, onChange, options],
	);

	const hasSelection = selected.length > 0;
	const label = !hasSelection
		? placeholder
		: selected.length === 1
			? (options.find((o) => o.value === selected[0])?.label ?? selected[0])
			: `${selected.length} sélectionnés`;

	return (
		<div
			className="relative"
			ref={ref}
		>
			<button
				onClick={() => setOpen((o) => !o)}
				className={`cursor-pointer flex items-center gap-2 text-sm px-4 py-2.5 border transition-all duration-200 min-w-[215px] justify-between bg-white ${
					open || hasSelection ? "border-[#B8935C] shadow-sm" : "border-stone-200 hover:border-stone-300"
				}`}
			>
				<span className={hasSelection ? "text-stone-800 font-medium" : "text-stone-400"}>{label}</span>
				<div className="flex items-center gap-1.5 shrink-0">
					{hasSelection && (
						<span
							onClick={(e) => {
								e.stopPropagation();
								onChange([]);
							}}
							className="size-4 flex items-center justify-center hover:opacity-80 cursor-pointer"
							style={{ backgroundColor: GOLD }}
						>
							<X className="size-2.5 text-white" />
						</span>
					)}
					<ChevronDown className={`size-3.5 text-stone-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
				</div>
			</button>

			{open && (
				<div className="absolute top-full left-0  bg-white border border-stone-200 shadow-xl z-40 py-1.5 min-w-[215px] max-h-72 overflow-y-auto">
					{options.map((opt) => {
						const isSel = selected.includes(opt.value);
						const isDisabled = opt.disabled;
						return (
							<button
								key={opt.value}
								onClick={() => toggle(opt.value)}
								disabled={isDisabled}
								className={`cursor-pointer w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors gap-3 ${
									isDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-stone-50"
								}`}
							>
								<span className={isSel ? "text-stone-900 font-medium" : "text-stone-600"}>{opt.label}</span>
								{isDisabled ? (
									<span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 shrink-0">Bientôt</span>
								) : (
									<span
										className={`size-4 rounded-sm border flex items-center justify-center shrink-0 transition-all ${
											isSel ? "border-[#B8935C]" : "border-stone-300"
										}`}
										style={isSel ? { backgroundColor: GOLD } : {}}
									>
										{isSel && <Check className="size-2.5 text-white" />}
									</span>
								)}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
