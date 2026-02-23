import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import SubmissionRequestPage from "@/pages/SubmissionRequestPage";
import BlogPage from "@/pages/BlogPage";

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
				path="/blogue"
				element={<BlogPage />}
			/>
		</Routes>
	);
}

export default App;
