import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
import FLLogo from "@/assets/images/flylooper.svg";

const FlightsSection = () => {
	useEffect(() => {
		const script = document.createElement("script");
		script.src =
			"https://tpembd.com/content?currency=cad&trs=16765&shmarker=185717.Aeria&show_hotels=false&powered_by=false&locale=fr&searchUrl=go.flylooper.com%2Fflights&primary_override=%2332a8dd&color_button=%233EB5ECff&color_icons=%233254DDff&dark=%23262626&light=%23FFFFFF&secondary=%23FFFFFF&special=%23C4C4C4&color_focused=%233267DDff&border_radius=0&no_labels=&plain=true&origin=YUL&promo_id=7879&campaign_id=100";
		script.async = true;
		script.charset = "utf-8";
		document.getElementById("flights-container")?.appendChild(script);

		return () => script.remove(); // cleanup
	}, []);

	return (
		<section
			id="flights"
			className="py-16 px-6 relative flex justify-center gap-10 items-center h-full w-full ratio-video rounded-md min-h-[80vh]"
			style={{ backgroundImage: "url('/src/assets/images/flight.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
		>
			<div className="bg-black/15 absolute inset-0" />
			<div className="max-w-7xl mx-auto flex md:flex-row flex-col md:justify-center gap-12 items-center w-full h-full z-10">
				<div className="flex flex-col gap-3 items-center md:items-left w-[50%] mr-8">
					<img
						src={FLLogo}
						alt="Welcome Pickups"
						className="w-125"
					/>
					<h2 className="hidden md:block text-4xl sm:text-5xl text-white font-black ml-14">
						Voyagez plus.
						<br />
						<span className="text-[#F6A707] block mt-3">Payez moins.</span>
					</h2>
					<p className="hidden md:block text-2xl font-medium text-stone-50 md:ml-8">Les meilleurs prix sur le marché !</p>
				</div>
				<div
					id="flights-container"
					className="shadow-sm"
				/>
			</div>
		</section>
	);
};

export default FlightsSection;
