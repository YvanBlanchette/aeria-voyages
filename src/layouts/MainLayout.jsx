import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

const MainLayout = ({ children, navbarVariant }) => {
	return (
		<div>
			<Navbar variant={navbarVariant} />
			<main>{children}</main>
			<Footer />
		</div>
	);
};
export default MainLayout;
