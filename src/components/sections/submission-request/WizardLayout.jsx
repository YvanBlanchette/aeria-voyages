import { GOLD } from "@/components/sections/submission-request/constants";
import travelBg from "@/assets/videos/travel-bg.webm";

export default function WizardLayout({ children }) {
	return (
		<div className="lg:flex w-screen h-full">
			<div className="relative hidden lg:block w-2/5 h-screen">
				<div className="bg-black/15 absolute inset-0 z-10" />
				<video
					className="absolute inset-0 w-full h-full object-cover"
					autoPlay
					muted
					loop
					playsInline
				>
					<source
						src={travelBg}
						type="video/webm"
					/>
				</video>
			</div>

			<div className="lg:w-3/5 w-screen h-screen overflow-y-scroll px-4 pt-6 pb-6 bg-gradient-to-br from-[#FAF7F2] via-[#F5F0E8] to-[#EDE5D8]">
				<div className="mx-auto w-full max-w-[680px]">
					<header className="text-center mb-5">
						<h1 className="mt-3 text-[clamp(24px,5vw,42px)] font-playfair font-light text-[#3D2E1E] leading-tight">
							Planifiez votre{" "}
							<em
								className="not-italic"
								style={{ color: GOLD }}
							>
								évasion
							</em>
						</h1>

						<p className="mt-2 mx-auto max-w-[460px] font-raleway text-[13px] font-light text-[#8B7355] leading-relaxed">
							Partagez vos envies, je m'occupe du reste. Chaque voyage est une histoire unique. Laissez-moi vous aider à écrire la vôtre.
						</p>
					</header>

					{children}

					<p className="text-center mt-6 font-raleway text-[11px] tracking-widest text-[#C4A882]">
						Vos informations sont confidentielles et ne seront jamais partagées
					</p>
				</div>
			</div>
		</div>
	);
}
