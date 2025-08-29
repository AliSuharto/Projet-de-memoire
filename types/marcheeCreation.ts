
interface Place {
  id: string;
  nom: string;
  numero: string;
}

interface Zone {
  id: string;
  nom: string;
  description: string;
  halls: Hall[];
  places: Place[];
}


interface Hall {
  id: string;
  nom: string;
  description: string;
  places: Place[];
}


interface Market {
  id: string;
  nom: string;
  adresse: string;
  description: string;
  zones: Zone[];
  halls: Hall[];
  places: Place[];
}


interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'save' | 'cancel';
}


   //Creation a computeFromManifest.
export interface Places {
  id: string;
  nom: string;
  numero: string;
  marketId: string;
  zoneId?: string;
  hallId?: string;
}

export interface Zones {
  id: string;
  nom: string;
  description: string;
  halls: Hall[];
  places: Places[];
  marketId: string;
}


export interface Halls {
  id: string;
  nom: string;
  description?: string;
  places: Places[];
  marketId: string;
  zoneId?: string;
}


export interface Markets {
  id: string;
  nom: string;
  adresse: string;
  description: string;
  zones: Zones[];
  halls: Halls[];
  places: Places[];
}

export type EntityType = 'zones' | 'halls' | 'places';