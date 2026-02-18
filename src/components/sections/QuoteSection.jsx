import { Badge } from "@/components/ui/badge";

const QuoteSection = () => {
	return (
		<section className="h-[500px] flex justify-between ">
			<div
				className="relative bg-cover h-full bg-center bg-no-repeat w-1/2"
				style={{ backgroundImage: "url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80)" }}
			>
				<div className="absolute inset-0 bg-black/30" />
				<div className="relative z-10 text-white text-center px-6 max-w-4xl">
					<div className="font-serif text-[120px] leading-none text-gold opacity-30 mb-4">"</div>
					<p className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light italic leading-relaxed mb-6">
						Le monde est comme un livre, ceux qui ne voyagent pas n'en lisent qu'une page
					</p>
					<Badge
						variant="outline"
						className="text-sm tracking-[0.3em] uppercase border-gold text-gold bg-transparent"
					>
						Saint Augustin
					</Badge>
				</div>
			</div>
			<div className="bg-[#F5F2EB] h-full w-1/2"></div>
		</section>
	);
};

export default QuoteSection;
