const TourCard = ({ tour, cardStyle, imgStyle }) => {
	return (
		<div
			className="tour-card"
			style={cardStyle}
		>
			<div className="image-wrapper">
				<img
					src={tour.images[0].link_large}
					alt={tour.tour_name}
					style={imgStyle}
				/>
				{tour.hasAeroplanPromotion && <div className="aeroplan-badge">✈️ {tour.promotions[0].description}</div>}
			</div>

			<div className="card-body">
				<span className="tour-type">{tour.tour_type}</span>
				<h3 className="tour-title">{tour.tour_name}</h3>

				<div className="tour-info">
					<span>📅 {tour.nb_days} jours</span>
					<span>📍 {tour.visited_locations.join(", ")}</span>
				</div>

				<div className="price-section">
					<span className="from">À partir de</span>
					<span className="price">{tour.price} $</span>
				</div>

				<a
					href={tour.tour_static_pdp_url}
					target="_blank"
					className="btn-explore"
				>
					Découvrir l'itinéraire
				</a>
			</div>
		</div>
	);
};

export default TourCard;
