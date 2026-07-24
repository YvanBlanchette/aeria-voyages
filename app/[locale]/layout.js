import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Playfair_Display, Raleway } from "next/font/google";
import { routing } from "@/i18n/routing";
import "../globals.css";

const playfairDisplay = Playfair_Display({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800"],
	variable: "--font-playfair",
	display: "swap",
});

const raleway = Raleway({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	variable: "--font-raleway",
	display: "swap",
});

export const metadata = {
	title: "ÆRIA Voyages",
	description: "ÆRIA Voyages",
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) notFound();

	const messages = await getMessages();

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "TravelAgency",
		name: "ÆRIA Voyages",
		url: "https://aeriavoyages.com",
		email: "contact@aeriavoyages.com",
		telephone: "+1-450-820-9720",
		address: {
			"@type": "PostalAddress",
			streetAddress: "400 - 3 Place Ville-Marie",
			addressLocality: "Montréal",
			addressRegion: "QC",
			postalCode: "H3B 2E3",
			addressCountry: "CA",
		},
	};

	return (
		<html
			lang={locale}
			suppressHydrationWarning
			className={`${playfairDisplay.variable} ${raleway.variable}`}
		>
			<head>
				<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
				<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
				<link rel="shortcut icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<meta name="apple-mobile-web-app-title" content="ÆRIA Voyages" />
				<link rel="manifest" href="/site.webmanifest" />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</head>
			<body suppressHydrationWarning>
				<NextIntlClientProvider locale={locale} messages={messages}>
					{children}
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
