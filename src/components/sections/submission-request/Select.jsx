import { GOLD } from "@/components/sections/submission-request/constants";
import { inputStyle } from "@/components/sections/submission-request/constants";
import GoldInput from "@/components/sections/submission-request/GoldInput";

const Select = ({ label, required, error, children, focused, setFocused, ...props }) => {
	return (
		<GoldInput
			label={label}
			required={required}
			error={error}
		>
			<div style={{ position: "relative" }}>
				<select
					{...props}
					style={{
						...inputStyle(error),
						appearance: "none",
						borderRadius: "8px",
						cursor: "pointer",
						borderColor: focused ? GOLD : error ? "#C0392B" : "rgba(184,147,92,0.3)",
						boxShadow: focused ? `0 0 0 3px rgba(184,147,92,0.15)` : "none",
					}}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
				>
					{children}
				</select>
				<span
					style={{
						position: "absolute",
						right: 14,
						top: "50%",
						transform: "translateY(-50%)",
						pointerEvents: "none",
						color: GOLD,
						fontSize: 12,
					}}
				>
					▾
				</span>
			</div>
		</GoldInput>
	);
};
export default Select;
