'use client';

import { ReactNode } from 'react';

interface ConfigContentProps {
  activeOption: string;
  children: ReactNode;
}

export default function ConfigContent({ activeOption, children }: ConfigContentProps) {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl">
        {children}
      </div>
    </div>
  );
}