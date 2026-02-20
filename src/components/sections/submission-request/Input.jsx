import { GOLD, inputStyle } from "@/components/sections/submission-request/constants";
import GoldInput from "@/components/sections/submission-request/GoldInput";

const Input = ({ label, required, error, hint, focused, setFocused, ...props }) => {
	return (
		<GoldInput
			label={label}
			required={required}
			error={error}
			hint={hint}
		>
			<input
				{...props}
				style={{
					...inputStyle(error),
					borderRadius: "8px",
					borderColor: focused ? GOLD : error ? "#C0392B" : "rgba(184,147,92,0.3)",
					boxShadow: focused ? `0 0 0 3px rgba(184,147,92,0.15)` : "none",
				}}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
			/>
		</GoldInput>
	);
};
export default Input;
