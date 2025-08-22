"use client";

import React, { useState, useMemo } from "react";
import { Plus, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation"; // ✅ Import correct
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";

// =======================
// Types
// =======================
type Market = {
  id: number;
  nom: string;
  nombreDePlace: number;
  tauxOccupation: number;
};

type CreateMarketModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type HeaderProps = {
  onCreateMarket: () => void;
};

type TableRowProps = {
  market: Market;
  index: number;
  onViewDetails: (market: Market) => void;
};

type MarketsTableProps = {
  markets: Market[];
  onViewDetails: (market: Market) => void;
};

// =======================
// Données simulées
// =======================
const SAMPLE_MARKETS: Market[] = [
  { id: 1, nom: "Marché Central", nombreDePlace: 150, tauxOccupation: 85 },
  { id: 2, nom: "Marché de Fruits", nombreDePlace: 80, tauxOccupation: 92 },
  { id: 3, nom: "Marché aux Poissons", nombreDePlace: 45, tauxOccupation: 78 },
  { id: 4, nom: "Marché des Légumes", nombreDePlace: 120, tauxOccupation: 95 },
  { id: 5, nom: "Marché Artisanal", nombreDePlace: 60, tauxOccupation: 67 },
  { id: 6, nom: "Marché Nocturne", nombreDePlace: 90, tauxOccupation: 88 },
  { id: 7, nom: "Marché Bio", nombreDePlace: 35, tauxOccupation: 100 },
  { id: 8, nom: "Marché de Viande", nombreDePlace: 25, tauxOccupation: 84 },
  { id: 9, nom: "Marché aux Fleurs", nombreDePlace: 40, tauxOccupation: 72 },
  { id: 10, nom: "Marché Traditionnel", nombreDePlace: 200, tauxOccupation: 89 },
];

// =======================
// Composants
// =======================

// Header
const Header: React.FC<HeaderProps> = ({ onCreateMarket }) => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold text-gray-800">Gestion des Marchés</h1>
    <button
      onClick={onCreateMarket}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
    >
      <Plus size={20} />
      Créer un marché
    </button>
  </div>
);

// Ligne de tableau
const TableRow: React.FC<TableRowProps> = ({ market, index, onViewDetails }) => (
  <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
    <td className="px-6 py-4 text-sm font-medium text-gray-900">{market.nom}</td>
    <td className="px-6 py-4 text-sm text-gray-700">{market.nombreDePlace}</td>
    <td className="px-6 py-4 text-sm text-gray-700">
      <div className="flex items-center">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            market.tauxOccupation >= 90
              ? "bg-green-100 text-green-800"
              : market.tauxOccupation >= 70
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {market.tauxOccupation}%
        </span>
      </div>
    </td>
    <td className="px-6 py-4 text-sm text-gray-500">
      <button
        onClick={() => onViewDetails(market)}
        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full transition-colors"
        title="Voir les détails"
      >
        <ChevronRight size={18} />
      </button>
    </td>
  </tr>
);

// Tableau des marchés
const MarketsTable: React.FC<MarketsTableProps> = ({ markets, onViewDetails }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-800">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
            Nom
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
            Nombre de places
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
            Taux occupation
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {markets.map((market, index) => (
          <TableRow
            key={market.id}
            market={market}
            index={index}
            onViewDetails={onViewDetails}
          />
        ))}
      </tbody>
    </table>
    {markets.length === 0 && (
      <div className="text-center py-8 text-gray-500">Aucun marché trouvé</div>
    )}
  </div>
);

// Modal création marché
const CreateMarketModal: React.FC<CreateMarketModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nom: "",
    adresse: "",
    nombreDePlace: "",
    description: "",
  });

  const handleSubmit = () => {
    if (!formData.nom.trim() || !formData.adresse.trim()) {
      alert("Veuillez remplir le nom et l'adresse du marché");
      return;
    }

    console.log("Création du marché:", formData);
    alert(`Marché "${formData.nom}" créé avec succès !`);
    onClose();
    setFormData({ nom: "", adresse: "", nombreDePlace: "", description: "" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative z-50 w-full max-w-md bg-white shadow-xl rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Créer un nouveau marché
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="relative z-50 w-full max-w-md bg-white shadow-xl rounded-2xl p-6"> 
            {/* Header */}
             
                      {/* Form */} 
                     <div className="space-y-4"> {/* Nom */} 
                        
                        <div> <label className="block text-sm font-medium text-gray-700 mb-1"> Nom du marché <span className="text-red-500">*</span> 
                        </label> <input type="text" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Entrez le nom du marché" /> 
                        </div> {/* Adresse */}
                        
                         <div> 
                            
                            <label className="block text-sm font-medium text-gray-700 mb-1"> Adresse <span className="text-red-500">*</span> </label>
                            
                             <input type="text" value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Entrez l'adresse du marché" /> 
                             
                             </div> {/* Nombre de places (optionnel) */} <div> <label className="block text-sm font-medium text-gray-700 mb-1"> Nombre de places (optionnel) </label> <input type="number" min="1" value={formData.nombreDePlace} onChange={(e) => setFormData({ ...formData, nombreDePlace: e.target.value }) } className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Entrez le nombre de places" /> </div> {/* Description */} <div> <label className="block text-sm font-medium text-gray-700 mb-1"> Description (optionnel) </label> <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Description du marché" /> </div> </div>
        {/* <div className="flex space-x-3 pt-6"> */}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
};

// =======================
// Composant principal
// =======================
const MarketsManagement: React.FC = () => {
  const router = useRouter(); // ✅ ici on initialise bien le router
  const [markets] = useState<Market[]>(SAMPLE_MARKETS);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const itemsPerPage = 5;

  // Filtrage
  const filteredMarkets = useMemo(
    () =>
      markets.filter((market) =>
        market.nom.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [markets, searchTerm]
  );

  // Pagination
  const totalPages = Math.ceil(filteredMarkets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMarkets = filteredMarkets.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handlers
  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleViewDetails = (market: Market) => {
    console.log("Voir les détails du marché:", market);
    router.push(`/dashboard/prmc/marches/${market.id}`); 
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Header onCreateMarket={() => setIsModalOpen(true)} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />

          <MarketsTable markets={paginatedMarkets} onViewDetails={handleViewDetails} />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        <CreateMarketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  );
};

export default MarketsManagement;
