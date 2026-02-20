import { GOLD } from "@/components/sections/submission-request/constants";

const GoldInput = ({ label, required, error, children, hint }) => {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
			<label
				style={{
					fontSize: 11,
					letterSpacing: "0.12em",
					textTransform: "uppercase",
					color: "#8B7355",
					fontWeight: 500,
				}}
			>
				{label} {required && <span style={{ color: GOLD }}>*</span>}
			</label>
			{children}
			{hint && !error && <span style={{ fontSize: 11, color: "#A89070" }}>{hint}</span>}
			{error && <span style={{ fontSize: 11, color: "#C0392B", display: "flex", alignItems: "center", gap: 4 }}>⚠ {error}</span>}
		</div>
	);
};
export default GoldInput;
