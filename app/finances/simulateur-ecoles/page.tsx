import { notFound } from "next/navigation";
import { schoolSimulatorAllowed } from "@/lib/school-access";
import { SchoolSimulator } from "@/components/school-simulator";
import "./simulator.css";
export const dynamic = "force-dynamic";
export default function SimulatorPage() {
  if (!schoolSimulatorAllowed(process.env)) notFound();
  return <SchoolSimulator />;
}
