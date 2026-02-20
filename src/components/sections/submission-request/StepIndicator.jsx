import { ETAPES, GOLD } from "@/components/sections/submission-request/constants";

export default function StepIndicator({ step }) {
	return (
		<div className="flex items-center justify-center mb-12">
			{ETAPES.map((s, idx) => (
				<div
					key={s.num}
					className="flex items-center"
				>
					<div className="flex flex-col items-center gap-2">
						<div
							className="w-5 h-5 rounded-full flex items-center justify-center font-raleway text-[10px] font-medium transition"
							style={{
								border: `1.5px solid ${step >= s.num ? GOLD : "rgba(184,147,92,0.3)"}`,
								background: step === s.num ? GOLD : step > s.num ? "rgba(184,147,92,0.2)" : "transparent",
								color: step === s.num ? "#fff" : step > s.num ? GOLD : "#C4A882",
							}}
						>
							{step > s.num ? "✓" : s.num}
						</div>

						<span
							className="font-raleway text-[10px] font-medium tracking-widest uppercase"
							style={{ color: step >= s.num ? GOLD : "#C4A882" }}
						>
							{s.label}
						</span>
					</div>

					{idx < ETAPES.length - 1 && (
						<div
							className="h-px w-16 mx-3 -mt-3 transition"
							style={{
								background: step > s.num ? `linear-gradient(90deg, ${GOLD}, rgba(184,147,92,0.3))` : "rgba(184,147,92,0.2)",
							}}
						/>
					)}
				</div>
			))}
		</div>
	);
}
