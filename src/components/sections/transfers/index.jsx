import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
import WPLogo from "@/assets/images/welcome_pickups-logo.png";

const TransfersSection = () => {
	useEffect(() => {
		const script = document.createElement("script");
		script.src =
			"https://tpembd.com/content?trs=16765&shmarker=185717.Aeria&locale=fr&city=Las%20Vegas&show_header=true&powered_by=false&campaign_id=627&promo_id=8951";
		script.async = true;
		script.charset = "utf-8";
		document.getElementById("welcomepickups-container")?.appendChild(script);

		return () => script.remove(); // cleanup
	}, []);

	return (
		<section
			id="transports"
			className="py-16 px-6 relative flex justify-around items-center h-full w-full ratio-video rounded-md backdrop-brightness-70"
			style={{ backgroundImage: "url('/src/assets/images/welcome_pickups.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
		>
			<div className="max-w-7xl mx-auto flex md:flex-row flex-col md:justify-around items-center w-full h-full">
				<div className="flex flex-col items-center md:items-left">
					<img
						src={WPLogo}
						alt="Welcome Pickups"
						className="w-125"
					/>
					<h2 className="hidden md:block text-4xl sm:text-6xl text-white font-black -mt-4 mb-3 ml-14">
						Arrivez.
						<br /> Découvrez.
						<br /> Profitez.
					</h2>
					<p className="hidden md:block text-xl font-medium text-stone-50 md:ml-8">Le mode de transport personnalisé des voyageurs</p>
				</div>
				<div
					id="welcomepickups-container"
					className="shadow-sm"
				/>
			</div>
		</section>
	);
};

export default TransfersSection;
