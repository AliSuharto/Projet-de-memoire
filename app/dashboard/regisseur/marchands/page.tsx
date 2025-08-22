'use client';

import ReusableDataTable from '@/components/Table';
import React from 'react';

// 1. Définir le type des données

type TableColumn<T> = {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
};


type Merchant = {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  revenue: number;
  place: {
    id: number;
    name: string;
    location: string;
  };
  payment: {
    method: string;
    lastPaymentDate: string;
  };
};

// 2. Créer des données fictives
const fakeMerchants: Merchant[] = [
  {
    id: 1,
    name: "Boulangerie Dupont",
    email: "contact@dupont-boulangerie.fr",
    status: "active",
    revenue: 12500.50,
    place: {
      id: 101,
      name: "Marché Central",
      location: "Paris 4ème"
    },
    payment: {
      method: "CB",
      lastPaymentDate: "2023-05-15"
    }
  },
  {
    id: 2,
    name: "Primeur Leclerc",
    email: "info@primeurleclerc.com",
    status: "pending",
    revenue: 8420.00,
    place: {
      id: 102,
      name: "Marché Bastille",
      location: "Paris 11ème"
    },
    payment: {
      method: "Virement",
      lastPaymentDate: "2023-04-28"
    }
  },
  {
    id: 3,
    name: "Fromagerie Laurent",
    email: "laurent@fromagerie.fr",
    status: "inactive",
    revenue: 0,
    place: {
      id: 103,
      name: "Marché Montorgueil",
      location: "Paris 2ème"
    },
    payment: {
      method: "PayPal",
      lastPaymentDate: "2023-01-10"
    }
  }
];

// 3. Définir les colonnes avec accès aux données imbriquées
const merchantColumns: TableColumn<Merchant>[] = [
  {
    key: 'id',
    header: 'ID'
  },
  {
    key: 'name',
    header: 'Nom du marchand'
  },
  {
    key: 'place.name', // Accès imbriqué
    header: 'Place de marché'
  },
  {
    key: 'status',
    header: 'Statut',
    render: (item:Merchant) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        item.status === 'active' 
          ? 'bg-green-100 text-green-800' 
          : item.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
      }`}>
        {item.status}
      </span>
    )
  },
  {
    key: 'revenue',
    header: 'CA (€)',
    render: (item:Merchant) => item.revenue.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    })
  },
  {
    key: 'payment.method',
    header: 'Méthode de paiement'
  }
];

// 4. Composant d'exemple
const MerchantTableExample = () => {
  const handleRowClick = (merchant: Merchant) => {
    console.log('Marchand sélectionné:', merchant);
    // Navigation vers le détail par exemple
    // navigate(`/merchants/${merchant.id}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Liste des marchands</h1>
      
      <ReusableDataTable<Merchant>
        columns={merchantColumns}
        data={fakeMerchants}
        uniqueKey="id"
        onRowClick={handleRowClick}
        className="shadow-md"
      />
    </div>
  );
};

export default MerchantTableExample;