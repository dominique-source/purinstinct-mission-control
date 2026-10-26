import type { Metadata } from "next";
import "./globals.css";
import { StudioProvider } from "@/components/provider";
export const metadata: Metadata = {
  title: "PÜRINSTINCT STUDIO — Mission Control",
  description:
    "Le système d’opération de Dominique. Cinq Worlds. Une vision. Chaque mission compte.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <StudioProvider>{children}</StudioProvider>
      </body>
    </html>
  );
}
