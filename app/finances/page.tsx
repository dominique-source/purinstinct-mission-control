import "./simulateur-ecoles/simulator.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell } from "@/components/shell";
import { schoolSimulatorAllowed } from "@/lib/school-access";
export const dynamic = "force-dynamic";
export default function Finances() {
  if (!schoolSimulatorAllowed(process.env)) notFound();
  return (
    <Shell>
      <section className="simulator">
        <p className="sim-eyebrow">MISSION CONTROL / FINANCES</p>
        <h1>FINANCES</h1>
        <p>Planifier les ressources. Mesurer l’impact.</p>
        <Link className="sim-action" href="/finances/simulateur-ecoles">
          Simulateur Écoles →
        </Link>
      </section>
    </Shell>
  );
}
