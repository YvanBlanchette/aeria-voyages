"use client";

const ESimSection = () => {
	return (
		<section
			id="esim"
			className="relative isolate overflow-hidden bg-stone-950"
		>
			<a
				href="https://holafly.sjv.io/aeriavoyages"
				target="_blank"
				rel="noopener noreferrer"
			>
				<video
					autoPlay
					muted
					loop
					playsInline
					className="absolute inset-0 w-full h-full object-cover"
				>
					<source
						src={"https://cdn.aeriavoyages.com/videos/aeria/holafly.mp4"}
						type="video/mp4"
						poster={"https://cdn.aeriavoyages.com/videos/aeria/holafly.jpg"}
					/>
				</video>
			</a>
		</section>
	);
};

export default ESimSection;
