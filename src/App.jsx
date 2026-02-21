import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import SubmissionRequestPage from "@/pages/SubmissionRequestPage";
import ACVToursPage from "@/pages/ACVToursPage";

function App() {
	return (
		<Routes>
			<Route
				path="/"
				element={<HomePage />}
			/>
			<Route
				path="/submission"
				element={<SubmissionRequestPage />}
			/>
			<Route
				path="/acv-tours"
				element={<ACVToursPage />}
			/>
		</Routes>
	);
}

export default App;
