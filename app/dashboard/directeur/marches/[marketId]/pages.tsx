import { use } from "react";
import { notFound } from "next/navigation";

interface MarchePageProps {
  params: { id: string };
}

// Exemple : récupérer l'id depuis l'URL
export default function MarchePage({ params }: MarchePageProps) {
  const { id } = params;

  // Ici tu peux fetch tes données depuis ton API Spring Boot
  // Exemple temporaire :
  const marche = { id, nom: "Marché Central", adresse: "Centre-ville" };

  if (!marche) return notFound();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Détails du Marché</h1>
      <p className="mt-4">ID : {marche.id}</p>
      <p>Nom : {marche.nom}</p>
      <p>Adresse : {marche.adresse}</p>
    </div>
  );
}
