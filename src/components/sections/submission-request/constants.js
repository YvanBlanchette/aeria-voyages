export const inputStyle = (error) => ({
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

export const ETAPES = [
	{ num: 1, label: "Vous" },
	{ num: 2, label: "Le voyage" },
	{ num: 3, label: "Détails" },
	{ num: 4, label: "Rêves" },
];

export const GOLD = "#B8935C";
export const GOLD_LIGHT = "#D4AA7D";
