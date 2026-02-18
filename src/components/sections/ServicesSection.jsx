import { Globe, Award, Users, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { services } from "@/lib/data";

const icons = [<Globe className="size-8" />, <Award className="size-8" />, <Users className="size-8" />, <Plane className="size-8" />];

const ServicesSection = () => {
	return (
		<section
			id="services"
			className="py-20 px-6 bg-white"
		>
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-16">
					<Badge
						variant="outline"
						className="text-xs tracking-[0.4em] uppercase mb-4 border-gold text-gold"
					>
						Notre Expertise
					</Badge>
					<h2 className="font-serif text-4xl lg:text-5xl font-semibold text-charcoal ">Services Exclusifs</h2>
					<Separator className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-10" />
				</div>

				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
					{services.map((service, index) => (
						<Card
							key={index}
							className="bg-cream border-none hover:bg-white hover:border-gold transition-all duration-500 hover:shadow-2xl"
						>
							<CardHeader className="text-center">
								<div className="inline-flex items-center justify-center size-16 bg-gold/10 text-gold rounded-full mb-4 mx-auto">{icons[index]}</div>
								<CardTitle className="font-serif text-2xl">{service.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-center leading-relaxed">{service.description}</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
};

export default ServicesSection;
