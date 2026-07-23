export function parseJSON(val) {
	try {
		return JSON.parse(val);
	} catch {
		return val;
	}
}
