interface Props {
  params: { id: string }
}

export default function MarcheDetailsPage({ params }: Props) {
  const { id } = params

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        Détails du marché {id}
      </h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">ID du marché: {id}</p>
        {/* Ajoutez ici le contenu de votre page de détails */}
      </div>
      
      <button 
        onClick={() => window.history.back()}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Retour à la liste des marchés
      </button>
    </div>
  )
}