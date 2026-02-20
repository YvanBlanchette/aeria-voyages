import { GOLD } from "@/components/sections/submission-request/constants";

const ChipGroup = ({ options, selected, onChange, multi = false }) => {
	const toggle = (val) => {
		if (multi) {
			onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
		} else {
			onChange(val === selected ? "" : val);
		}
	};
	const isSelected = (val) => (multi ? selected.includes(val) : selected === val);

	return (
		<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
			{options.map((opt) => (
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
};

export default ChipGroup;
