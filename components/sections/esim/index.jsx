"use client";

const ESimSection = () => {
	return (
		<section
			id="esim"
			chassName="relative overflow-hidden min-h-[70vh] h-screen"
		>
			<a
				href="https://holafly.sjv.io/aeriavoyages"
				target="_blank"
				rel="noopener noreferrer"
				className="absolute inset-0 w-full h-full"
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
