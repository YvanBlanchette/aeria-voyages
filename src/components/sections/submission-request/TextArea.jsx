import { inputStyle } from "@/components/sections/submission-request/constants";
import GoldInput from "@/components/sections/submission-request/GoldInput";
import { GOLD } from "@/components/sections/submission-request/constants";

const TextArea = ({ label, required, error, hint, focused, setFocused, ...props }) => {
	return (
		<GoldInput
			label={label}
			required={required}
			error={error}
			hint={hint}
		>
			<textarea
				{...props}
				style={{
					...inputStyle(error),
					minHeight: 120,
					lineHeight: 1.6,
					borderRadius: "8px",
					resize: "none",
					borderColor: focused ? GOLD : error ? "#C0392B" : "rgba(184,147,92,0.3)",
					boxShadow: focused ? `0 0 0 3px rgba(184,147,92,0.15)` : "none",
				}}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
			/>
		</GoldInput>
	);
};

export default TextArea;
