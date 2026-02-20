import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import SubmissionRequest from "@/pages/SubmissionRequest";

function App() {
	return (
		<Routes>
			<Route
				path="/"
				element={<Home />}
			/>
			<Route
				path="/"
				element={<SubmissionRequest />}
			/>
		</Routes>
	);
}

export default App;
