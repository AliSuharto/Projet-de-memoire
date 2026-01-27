'use client';
import React, { useEffect } from 'react';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

const HelpPage: React.FC = () => {

  const sections: Section[] = [
    {
      id: 'apercu',
      title: 'Aperçu',
      content: (
        <div>
          <h1 className="text-4xl font-light mb-8">Composants d'un microcontrôleur</h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            Cette section présente les principaux composants et concepts liés aux microcontrôleurs.
            Naviguez dans le menu latéral pour explorer chaque sujet en détail.
          </p>
        </div>
      )
    },
    {
      id: 'composants',
      title: "Composants d'un microcontrôleur",
      content: (
        <div>
          <h1 className="text-4xl font-light mb-8">Composants d'un microcontrôleur</h1>
          <p className="text-lg text-gray-700 mb-6">
            Voici les principaux composants d'un microcontrôleur :
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-start">
                <span className="text-blue-600 mr-3">—</span>
                <span>Unité centrale de traitement (CPU)</span>
              </h3>
              <p className="text-gray-700 ml-8 leading-relaxed">
                Communément appelée « cerveau » de l'ordinateur, le{' '}
                <span className="text-blue-600 font-medium">CPU</span> est le composant principal 
                responsable de l'exécution des instructions et du contrôle des opérations.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-start">
                <span className="text-blue-600 mr-3">—</span>
                <span>Mémoire</span>
              </h3>
              <p className="text-gray-700 ml-8 leading-relaxed">
                Les microcontrôleurs contiennent à la fois une mémoire volatile (RAM) qui, 
                contrairement à la mémoire programme, stocke des données temporaires qui peuvent 
                être perdues si le système perd son alimentation, et une mémoire flash non volatile 
                pour stocker le jeu d'instructions de programmation du microcontrôleur (micrologiciel).
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-start">
                <span className="text-blue-600 mr-3">—</span>
                <span>Périphériques</span>
              </h3>
              <p className="text-gray-700 ml-8 leading-relaxed">
                En fonction de l'application envisagée, un microcontrôleur peut contenir divers 
                composants auxiliaires, tels que des interfaces E/S—dont des minuteries, des compteurs, 
                des convertisseurs de signaux analogiques-numériques (ADC) et numériques-analogiques (DAC)—et 
                des protocoles de communication (UART, SPI, I2C). Les appareils auxiliaires permettent au 
                microcontrôleur d'interagir avec le monde extérieur.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'vs-microprocesseurs',
      title: 'Microcontrôleurs vs microprocesseurs',
      content: (
        <div>
          <h1 className="text-4xl font-light mb-8">Microcontrôleurs vs microprocesseurs</h1>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Bien que les termes soient souvent utilisés de manière interchangeable, il existe des 
            différences importantes entre les microcontrôleurs et les microprocesseurs.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-900">Microcontrôleur</h3>
            <p className="text-gray-700 leading-relaxed">
              Un système complet sur une seule puce, intégrant CPU, mémoire et périphériques. 
              Conçu pour des tâches spécifiques et des applications embarquées.
            </p>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-r-lg">
            <h3 className="text-xl font-semibold mb-3 text-purple-900">Microprocesseur</h3>
            <p className="text-gray-700 leading-relaxed">
              Uniquement le CPU, nécessite des composants externes (mémoire, périphériques). 
              Plus puissant et flexible, utilisé dans les ordinateurs et systèmes complexes.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'differences',
      title: 'Principales différences entre les microcontrôleurs et les microprocesseurs',
      content: (
        <div>
          <h1 className="text-4xl font-light mb-8">Principales différences</h1>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-6 py-3 text-left font-semibold">Aspect</th>
                  <th className="border border-gray-300 px-6 py-3 text-left font-semibold">Microcontrôleur</th>
                  <th className="border border-gray-300 px-6 py-3 text-left font-semibold">Microprocesseur</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-6 py-4 font-medium">Architecture</td>
                  <td className="border border-gray-300 px-6 py-4">Système sur puce (SoC)</td>
                  <td className="border border-gray-300 px-6 py-4">CPU uniquement</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-6 py-4 font-medium">Coût</td>
                  <td className="border border-gray-300 px-6 py-4">Faible (1-10€)</td>
                  <td className="border border-gray-300 px-6 py-4">Élevé (50-500€+)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-6 py-4 font-medium">Consommation</td>
                  <td className="border border-gray-300 px-6 py-4">Très faible</td>
                  <td className="border border-gray-300 px-6 py-4">Élevée</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-6 py-4 font-medium">Applications</td>
                  <td className="border border-gray-300 px-6 py-4">IoT, embarqué, domotique</td>
                  <td className="border border-gray-300 px-6 py-4">PC, serveurs, smartphones</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'types',
      title: 'Types de microcontrôleurs',
      content: (
        <div>
          <h1 className="text-4xl font-light mb-8">Types de microcontrôleurs</h1>
          
          <div className="grid gap-6">
            <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <h3 className="text-2xl font-semibold mb-3 text-blue-600">8-bit</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Les microcontrôleurs les plus simples et économiques. Idéaux pour les tâches basiques.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Exemples :</strong> AVR (Arduino), PIC16, 8051
              </p>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-purple-400 transition-colors">
              <h3 className="text-2xl font-semibold mb-3 text-purple-600">16-bit</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Offrent un bon équilibre entre performance et consommation d'énergie.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Exemples :</strong> MSP430, PIC24
              </p>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-400 transition-colors">
              <h3 className="text-2xl font-semibold mb-3 text-green-600">32-bit</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Haute performance pour applications complexes nécessitant calculs intensifs.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Exemples :</strong> ARM Cortex-M, ESP32, STM32
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

   

  return (
    <div className="flex min-h-screen bg-white">
        {/* Sidebar */}

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 'ml-0' : 'ml-56'
      }`}>
        <div className="w-full p-8 max-w-full">
          <div className="max-w-4xl">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="mb-16 scroll-mt-8"
              >
                {section.content}
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpPage;