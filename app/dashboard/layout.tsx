// app/(dashboard)/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GMC Application',
  description: 'Gestion de votre contenu',
};
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div>
      <main >
        <div className="p-0 md:p-0">{children}</div>
      </main>
    </div>
  );
}
