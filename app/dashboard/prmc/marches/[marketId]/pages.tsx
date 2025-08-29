'use client';

import MarketDetails from '@/components/(Directeur)/MarketDetails';
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MarketPage({ params }: PageProps) {
  const { id } = use(params);
  
  return <MarketDetails marketId={id} />;
}