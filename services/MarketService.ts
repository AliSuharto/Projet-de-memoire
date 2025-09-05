import { Markets, Zones, Halls, Places, EntityType } from '@/types/marcheeCreation';

class MarketService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  async getMarketById(marketId: string): Promise<Markets> {
    const response = await fetch(`${this.baseUrl}/marchees/${marketId}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du marché');
    }
    return response.json();
  }

  async createEntity(type: EntityType, data: any): Promise<void> {
    const endpoint = `${this.baseUrl}/${type}s`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la création du ${type}`);
    }
  }

  async updateEntity(type: EntityType, id: string, data: any): Promise<void> {
    const endpoint = `${this.baseUrl}/${type}s/${id}`;
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la mise à jour du ${type}`);
    }
  }

  async deleteEntity(type: EntityType, id: string): Promise<void> {
    const endpoint = `${this.baseUrl}/${type}s/${id}`;
    const response = await fetch(endpoint, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression du ${type}`);
    }
  }
}

export const marketService = new MarketService();