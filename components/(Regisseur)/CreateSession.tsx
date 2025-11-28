import React, { useState, useMemo } from 'react';
import { ArrowUpDown } from 'lucide-react';

const mockData = [
  {
    id: 77,
    nom: "Rabe",
    statut: "A_JOUR",
    activite: "Vente chaussures",
    telephone: "342345678",
    places: [
      {
        nom: "P02",
        salleName: "Hall1",
        zoneName: "Zone A",
        marcheeName: "Marché Central"
      }
    ],
    paiements: [
      { date: "2025-11-20T10:30:00" },
      { date: "2025-10-15T14:20:00" }
    ]
  },
  {
    id: 78,
    nom: "Rakoto",
    statut: "RETARD_LEGER",
    activite: "Fruits et légumes",
    telephone: "343456789",
    places: [
      {
        nom: "P15",
        salleName: "Hall2",
        zoneName: "Zone B",
        marcheeName: "Marché Central"
      }
    ],
    paiements: [
      { date: "2025-09-25T09:15:00" }
    ]
  },
  {
    id: 79,
    nom: "Nivo",
    statut: "RETARD_SIGNIFICATIF",
    activite: "Vêtements",
    telephone: "344567890",
    places: [
      {
        nom: "P23",
        salleName: "Hall1",
        zoneName: "Zone C",
        marcheeName: "Marché Sud"
      }
    ],
    paiements: [
      { date: "2025-08-10T16:45:00" }
    ]
  },
  {
    id: 80,
    nom: "Vonjy",
    statut: "RETARD_CRITIQUE",
    activite: "Électronique",
    telephone: "345678901",
    places: [
      {
        nom: "P08",
        salleName: "Hall3",
        zoneName: "Zone A",
        marcheeName: "Marché Nord"
      }
    ],
    paiements: [
      { date: "2025-07-05T11:20:00" }
    ]
  },
  {
    id: 81,
    nom: "Hery",
    statut: "RETARD_PROLONGER",
    activite: "Alimentation",
    telephone: "346789012",
    places: [
      {
        nom: "P12",
        salleName: "Hall2",
        zoneName: "Zone B",
        marcheeName: "Marché Central"
      }
    ],
    paiements: [
      { date: "2025-05-15T08:30:00" }
    ]
  },
  {
    id: 82,
    nom: "Fara",
    statut: "A_JOUR",
    activite: "Cosmétiques",
    telephone: "347890123",
    places: [
      {
        nom: "P19",
        salleName: "Hall1",
        zoneName: "Zone A",
        marcheeName: "Marché Sud"
      }
    ],
    paiements: [
      { date: "2025-11-22T13:40:00" }
    ]
  }
];

const statutColors = {
  A_JOUR: 'bg-green-100 text-green-800 border-green-300',
  RETARD_LEGER: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  RETARD_SIGNIFICATIF: 'bg-orange-100 text-orange-800 border-orange-300',
  RETARD_CRITIQUE: 'bg-red-200 text-red-900 border-red-400',
  RETARD_PROLONGER: 'bg-red-300 text-red-950 border-red-500'
};

const statutLabels = {
  A_JOUR: 'À jour',
  RETARD_LEGER: 'Retard léger',
  RETARD_SIGNIFICATIF: 'Retard significatif',
  RETARD_CRITIQUE: 'Retard critique',
  RETARD_PROLONGER: 'Retard prolongé'
};

export default function MarchandsTable() {
  const [data] = useState(mockData);
  const [statutFilter, setStatutFilter] = useState('');
  const [marcheeFilter, setMarcheeFilter] = useState('');
  const [hallFilter, setHallFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Aucun';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLastPaiement = (paiements) => {
    if (!paiements || paiements.length === 0) return null;
    return paiements.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date;
  };

  const uniqueValues = useMemo(() => {
    const marchees = new Set();
    const halls = new Set();
    const zones = new Set();
    const statuts = new Set();

    data.forEach(marchand => {
      statuts.add(marchand.statut);
      marchand.places.forEach(place => {
        if (place.marcheeName) marchees.add(place.marcheeName);
        if (place.salleName) halls.add(place.salleName);
        if (place.zoneName) zones.add(place.zoneName);
      });
    });

    return {
      marchees: Array.from(marchees).sort(),
      halls: Array.from(halls).sort(),
      zones: Array.from(zones).sort(),
      statuts: Array.from(statuts)
    };
  }, [data]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(marchand => {
      const matchStatut = !statutFilter || marchand.statut === statutFilter;
      const matchMarchee = !marcheeFilter || marchand.places.some(p => p.marcheeName === marcheeFilter);
      const matchHall = !hallFilter || marchand.places.some(p => p.salleName === hallFilter);
      const matchZone = !zoneFilter || marchand.places.some(p => p.zoneName === zoneFilter);
      
      return matchStatut && matchMarchee && matchHall && matchZone;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'nom') {
          aValue = a.nom;
          bValue = b.nom;
        } else if (sortConfig.key === 'statut') {
          const ordre = ['A_JOUR', 'RETARD_LEGER', 'RETARD_SIGNIFICATIF', 'RETARD_CRITIQUE', 'RETARD_PROLONGER'];
          aValue = ordre.indexOf(a.statut);
          bValue = ordre.indexOf(b.statut);
        } else if (sortConfig.key === 'dernierPaiement') {
          aValue = getLastPaiement(a.paiements) || '';
          bValue = getLastPaiement(b.paiements) || '';
        } else if (sortConfig.key === 'adresse') {
          aValue = a.places[0]?.marcheeName || '';
          bValue = b.places[0]?.marcheeName || '';
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, statutFilter, marcheeFilter, hallFilter, zoneFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Liste des Marchands</h1>
      
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              {uniqueValues.statuts.map(statut => (
                <option key={statut} value={statut}>{statutLabels[statut]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marché</label>
            <select
              value={marcheeFilter}
              onChange={(e) => setMarcheeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les marchés</option>
              {uniqueValues.marchees.map(marchee => (
                <option key={marchee} value={marchee}>{marchee}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hall</label>
            <select
              value={hallFilter}
              onChange={(e) => setHallFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les halls</option>
              {uniqueValues.halls.map(hall => (
                <option key={hall} value={hall}>{hall}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les zones</option>
              {uniqueValues.zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
        </div>

        {(statutFilter || marcheeFilter || hallFilter || zoneFilter) && (
          <button
            onClick={() => {
              setStatutFilter('');
              setMarcheeFilter('');
              setHallFilter('');
              setZoneFilter('');
            }}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('nom')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Nom du Marchand
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('adresse')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Adresse
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('statut')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Statut
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('dernierPaiement')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Dernier Paiement
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedData.map((marchand) => (
                <tr key={marchand.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{marchand.nom}</div>
                    <div className="text-sm text-gray-500">{marchand.activite}</div>
                  </td>
                  <td className="px-6 py-4">
                    {marchand.places.map((place, idx) => (
                      <div key={idx} className="text-sm text-gray-900">
                        <span className="font-medium">{place.nom}</span>
                        {' / '}
                        <span>{place.salleName}</span>
                        {place.zoneName && (
                          <>
                            {' / '}
                            <span>{place.zoneName}</span>
                          </>
                        )}
                        {place.marcheeName && (
                          <>
                            {' / '}
                            <span className="text-gray-600">{place.marcheeName}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statutColors[marchand.statut]}`}>
                      {statutLabels[marchand.statut]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(getLastPaiement(marchand.paiements))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun marchand trouvé avec ces filtres
          </div>
        )}

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          {filteredAndSortedData.length} marchand(s) affiché(s)
        </div>
      </div>
    </div>
  );
}