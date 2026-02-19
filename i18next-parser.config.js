export default {
	locales: ["fr", "en"],
	output: "src/locales/$LOCALE.json",
	input: ["src/**/*.{js,jsx}"],
	defaultNamespace: "translation",
	keepRemoved: false,
	createOldCatalogs: false,
};
