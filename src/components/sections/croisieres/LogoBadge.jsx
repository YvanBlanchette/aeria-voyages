import { LOGOS_CONFIG } from "./constants";

export default function LogoBadge({ compagnie, size = "card" }) {
  const config = LOGOS_CONFIG[compagnie];
  const isModal = size === "modal";

  if (!config)
    return (
      <div className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white text-[10px] tracking-widest uppercase font-bold">
        {compagnie}
      </div>
    );

  return (
    <div className="px-2.5 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm flex items-center">
      <img
        src={config.src}
        alt={compagnie}
        style={{
          height: isModal ? config.maxH * 1.2 : config.maxH * 0.75,
          width: "auto",
          objectFit: "contain",
        }}
        className="drop-shadow-md"
        onError={(e) => {
          e.target.replaceWith(
            Object.assign(document.createElement("span"), {
              textContent: compagnie,
              style:
                "font-size:10px;color:white;font-weight:700;text-transform:uppercase;letter-spacing:.1em;text-shadow:0 1px 3px rgba(0,0,0,.5)",
            }),
          );
        }}
      />
    </div>
  );
}
