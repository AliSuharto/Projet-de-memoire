import React from 'react';
// import SetupWizard from '@/components/setup/SetupWizard';

// export default function SetupPage() {
//   return <SetupWizard />;
// }
import React from "react";

interface BonjourProps {
  nom?: string;
}

const Bonjour: React.FC<BonjourProps> = ({ nom = "Monde" }) => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bonjour {nom} 👋</h1>
      <p style={styles.subtitle}>
        Bienvenue sur votre application TypeScript.
      </p>
    </div>
  );
};