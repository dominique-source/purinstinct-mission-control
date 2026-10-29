import Image from "next/image";
export const worldArt: Record<string, { src: string; reward: string }> = {
  vanier: { src: "/images/vanier.webp", reward: "LANCER LE FINANCEMENT" },
  instinct: { src: "/images/instinct.webp", reward: "PARTENARIAT ZONE3" },
  cliniques: { src: "/images/cliniques.webp", reward: "REVENUS ACTIFS" },
  technologie: { src: "/images/technologie.webp", reward: "SYSTÈME PRÊT" },
  financement: {
    src: "/images/financement.webp",
    reward: "15 000 $ → 40 000 $",
  },
};
export function CampaignArt({
  worldId,
  className = "",
  priority = false,
}: {
  worldId: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`campaign-art ${className}`} aria-hidden="true">
      <Image
        src={worldArt[worldId]?.src || "/images/campaign-backdrop.webp"}
        alt=""
        fill
        sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 30vw"
        priority={priority}
      />
    </div>
  );
}
