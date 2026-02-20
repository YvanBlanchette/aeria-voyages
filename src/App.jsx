import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import SubmissionRequestPage from "@/pages/SubmissionRequestPage";

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
		</Routes>
	);
}

export default App;
