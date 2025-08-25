# e-GMC - Frontend Next.js 15

Application web frontend pour la gestion de marchés communaux, développée avec Next.js 15, TypeScript et Tailwind CSS.

## 🚀 Fonctionnalités

### Premier accès
- **Vérification automatique de commune** : L'application vérifie si une commune existe au premier lancement
- **Configuration initiale** : Processus multi-étapes pour créer une commune et un ordonnateur
- **Validation par email** : Code de vérification envoyé par email

### Authentification
- **Connexion sécurisée** : Système d'authentification avec JWT
- **Gestion des rôles** : Support de 6 rôles différents
- **Redirection automatique** : Vers le dashboard approprié selon le rôle

### Dashboards par rôle
- **Ordonnateur** : Vue globale, statistiques, gestion d'équipe
- **Directeur** : Gestion des marchés, utilisateurs et permissions
- **Régisseur** : Gestion financière et marchands endettés
- **Régisseur Principal** : Vue d'ensemble financière
- **Percepteur** : Gestion des paiements et reçus
- **Créateur de marché** : Interface éphémère pour création de marchés

## 🛠️ Technologies

- **Next.js 15** avec App Router
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le design
- **Axios** pour les requêtes API
- **React Hook Form** pour la gestion des formulaires
- **Lucide React** pour les icônes

## 📁 Structure du projet

```
├── app/                          # App Router Next.js 15
│   ├── (auth)/                   # Groupe de routes d'authentification
│   │   └── login/                # Page de connexion
│   ├── dashboard/                # Dashboards par rôle
│   │   ├── ordonnateur/          # Dashboard ordonnateur
│   │   ├── directeur/            # Dashboard directeur
│   │   ├── percepteur/           # Dashboard percepteur
│   │   └── [role]/               # Routes dynamiques par rôle
│   ├── setup/                    # Configuration initiale
│   └── layout.tsx                # Layout racine
├── components/                   # Composants réutilisables
│   ├── auth/                     # Composants d'authentification
│   ├── setup/                    # Composants de configuration
│   ├── ui/                       # Composants UI de base
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Stepper.tsx
│   │   └── Toast.tsx
│   └── dashboard/                # Composants de dashboard
├── services/                     # Services API
│   ├── api.ts                    # Configuration Axios
│   ├── authService.ts            # Service d'authentification
│   └── communeService.ts         # Service de gestion commune
├── hooks/                        # Hooks personnalisés
│   ├── useRoleNavigation.ts      # Navigation par rôle
│   └── useModal.ts               # Gestion des modales
├── lib/                          # Utilitaires
│   ├── auth.ts                   # Logique d'authentification
│   └── navigation-config.ts      # Configuration navigation
└── types/                        # Types TypeScript
    └── navigation.ts             # Types de navigation
```

## 🔧 Installation et démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone [url-du-repo]
cd gmc

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Modifier NEXT_PUBLIC_API_URL selon votre backend
```

### Démarrage en développement
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 🔐 Configuration des rôles

### Rôles supportés
1. **Ordonnateur** - Vue globale et gestion d'équipe
2. **Directeur** - Gestion des marchés et utilisateurs
3. **Régisseur** - Gestion financière
4. **Régisseur Principal** - Vue d'ensemble financière
5. **Percepteur** - Gestion des paiements
6. **Créateur de marché** - Création de marchés (temporaire)

### Navigation synchronisée
- **SideNav** et **BurgerMenu** utilisent la même configuration
- Navigation personnalisée par rôle
- Ajout/modification centralisée dans `lib/navigation-config.ts`

## 🌐 Intégration API

### Configuration
```typescript
// services/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
});
```

### Endpoints utilisés
- `GET /commune/check` - Vérification commune
- `POST /communeordonnateur/create` - Création commune + ordonnateur
- `POST /auth/login` - Connexion
- `POST /auth/validate-code` - Validation code email
- `POST /auth/resend-code` - Renvoi code

## 🎨 Design et UX

### Principes de design
- **Responsive** : Mobile-first avec Tailwind CSS
- **Accessible** : Support des lecteurs d'écran
- **Moderne** : Interface claire et professionnelle
- **Cohérent** : Design system avec composants réutilisables

### Composants UI
- **Button** : Boutons avec états loading et variantes
- **Input** : Champs avec validation et icônes
- **Toast** : Notifications avec types (success, error, warning, info)
- **Stepper** : Progression multi-étapes
- **Modal** : Modales avec overlay

## 🚦 Flux d'utilisation

### Premier accès
1. **Vérification commune** → Si commune existe → Redirection login
2. **Si aucune commune** → Wizard de configuration :
   - Étape 1 : Informations commune
   - Étape 2 : Informations ordonnateur  
   - Étape 3 : Validation code email
3. **Après validation** → Redirection login

### Connexion
1. **Saisie identifiants** → Validation
2. **Si succès** → Redirection dashboard selon rôle
3. **Gestion des erreurs** → Messages toast

### Navigation
1. **Chargement navigation** → Basée sur le rôle utilisateur
2. **SideNav + TopNav** → Synchronisés automatiquement
3. **Responsive** → BurgerMenu sur mobile

## 🔧 Développement

### Commandes utiles
```bash
# Développement avec Turbopack
npm run dev

# Build de production
npm run build

# Linting
npm run lint

# Start production
npm run start
```

### Structure des composants
```typescript
// Exemple de composant avec types
interface ComponentProps {
  title: string;
  onAction: () => void;
}

const Component = ({ title, onAction }: ComponentProps) => {
  // Logique du composant
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
};
```

### Gestion des états
- **Context API** pour l'authentification
- **useState/useEffect** pour les états locaux
- **Custom hooks** pour la logique réutilisable

## 🧪 Tests et qualité

### Linting
- **ESLint** configuré pour Next.js 15
- **TypeScript** strict mode
- **Prettier** pour le formatage

### Bonnes pratiques
- Composants typés avec TypeScript
- Hooks personnalisés pour la logique métier
- Services API séparés
- Configuration centralisée

## 📱 Responsive Design

### Breakpoints Tailwind
- `sm`: 640px+
- `md`: 768px+  
- `lg`: 1024px+
- `xl`: 1280px+

### Navigation mobile
- **BurgerMenu** : Menu hamburger sur mobile
- **SideNav** : Caché sur mobile, visible sur desktop
- **Responsive** : Adaptation automatique

## 🔒 Sécurité

### Authentification
- **JWT** stocké en localStorage (configurable)
- **Intercepteurs Axios** pour les tokens
- **Routes protégées** par rôle
- **Redirection automatique** si non authentifié

### Validation
- **Validation côté client** avec React Hook Form
- **Types TypeScript** pour la sécurité
- **Sanitisation** des données utilisateur

## 🚀 Déploiement

### Variables d'environnement
```env
NEXT_PUBLIC_API_URL=https://votre-backend-url.com/api
NEXT_PUBLIC_APP_NAME=e-GMC
```

### Build de production
```bash
npm run build
npm start
```

## 📞 Support

Pour toute question ou problème :
1. Vérifiez la documentation
2. Consultez les logs de développement
3. Contactez l'équipe de développement

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025
