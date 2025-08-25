# 🚀 Guide d'Utilisation - e-GMC

## 📋 Vue d'Ensemble

Votre plateforme de gestion de marchés communaux est maintenant entièrement refactorisée avec des composants réutilisables et un système d'authentification complet.

## 🔐 Connexion

### Comptes de Démonstration

Utilisez ces comptes pour tester les différents rôles :

| Rôle | Email | Mot de passe | Accès |
|------|-------|--------------|-------|
| **Admin** | admin@egmc.com | n'importe lequel | Tous les dashboards |
| **PRMC** | prmc@egmc.com | n'importe lequel | Gestion marchés/marchands/utilisateurs |
| **Ordonnateur** | ordo@egmc.com | n'importe lequel | Consultation et configuration |
| **Régisseur** | regisseur@egmc.com | n'importe lequel | Gestion quotidienne |
| **PERP** | perp@egmc.com | n'importe lequel | Contrôles et conformité |

## 🏗️ Architecture des Composants

### 📊 DataTable - Composant Réutilisable

Le composant `DataTable` est maintenant utilisé partout et offre :

```tsx
<DataTable
  data={yourData}
  columns={columns}
  actions={actions}
  searchOptions={{
    placeholder: "Rechercher...",
    searchableFields: ['nom', 'email']
  }}
  paginationOptions={{
    itemsPerPage: 10,
    showItemsPerPageSelector: true
  }}
/>
```

**Fonctionnalités :**
- ✅ Recherche intelligente multi-champs
- ✅ Tri sur toutes les colonnes
- ✅ Pagination configurable
- ✅ Actions personnalisables
- ✅ États de chargement
- ✅ Messages d'erreur/vide
- ✅ Design responsive

### 🎨 Composants UI

#### Modal
```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Mon Modal">
  <ModalContent>
    {/* Contenu */}
  </ModalContent>
  <ModalFooter>
    {/* Boutons */}
  </ModalFooter>
</Modal>
```

#### Button
```tsx
<Button
  variant="primary|secondary|danger|success|outline"
  size="sm|md|lg"
  loading={isLoading}
  icon={PlusIcon}
>
  Mon Bouton
</Button>
```

#### StatusBadge
```tsx
<StatusBadge 
  status="Actif|Inactif|Pending" 
  variant="success|warning|danger"
  size="sm|md|lg"
/>
```

## 🔧 Hooks Personnalisés

### useDataTable
Gère toute la logique des tableaux :
```tsx
const {
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  sortedData,
  paginatedData,
  handleSort
} = useDataTable({
  data: myData,
  searchableFields: ['nom', 'email'],
  initialItemsPerPage: 10
});
```

### useModal
Gère l'état des modals :
```tsx
const { isOpen, open, close } = useModal();
```

## 🛡️ Système d'Authentification

### Permissions par Rôle

| Rôle | Permissions |
|------|-------------|
| **Admin** | Toutes les permissions |
| **PRMC** | Gestion marchés, marchands, utilisateurs |
| **Ordonnateur** | Consultation, configuration |
| **Régisseur** | Gestion quotidienne des marchés |
| **PERP** | Contrôles et conformité |

### Protection des Routes

Les routes sont automatiquement protégées selon les rôles :

```tsx
<ProtectedRoute requiredPermission="markets.create">
  <MonComposant />
</ProtectedRoute>
```

## 📱 Dashboards par Rôle

### Dashboard Admin
- Vue d'ensemble globale
- Accès à tous les autres dashboards
- Statistiques générales

### Dashboard PRMC
- Gestion des marchés
- Gestion des marchands
- Gestion des utilisateurs
- Statistiques des marchés

### Dashboard Ordonnateur
- Configuration système
- Budgets et projets
- Réunions et planification

### Dashboard Régisseur
- Recettes quotidiennes
- Présence des marchands
- Gestion des incidents

### Dashboard PERP
- Contrôles effectués
- Infractions constatées
- Taux de conformité

## 🚀 Démarrage Rapide

1. **Lancez l'application :**
   ```bash
   npm run dev
   ```

2. **Accédez à :** `http://localhost:3000`

3. **Connectez-vous** avec un des comptes de démo

4. **Explorez** les différents dashboards selon votre rôle

## 📊 Pages Principales

### Gestion des Marchés
- **URL :** `/dashboard/prmc/marches/listeMarches`
- **Fonctionnalités :**
  - Liste des marchés avec recherche et tri
  - Création de nouveaux marchés
  - Modification et suppression
  - Visualisation des détails

### Gestion des Utilisateurs
- **URL :** `/dashboard/prmc/users`
- **Fonctionnalités :**
  - Liste des utilisateurs
  - Création de nouveaux comptes
  - Gestion des rôles et permissions
  - Visualisation des profils

## 🔄 Réutilisabilité

### Créer une Nouvelle Page avec Tableau

1. **Définissez vos types :**
```tsx
interface MonEntity {
  id: number;
  nom: string;
  // autres propriétés
}
```

2. **Configurez les colonnes :**
```tsx
const columns: TableColumn<MonEntity>[] = [
  {
    key: 'nom',
    header: 'Nom',
    sortable: true,
    render: (item) => <span>{item.nom}</span>
  }
];
```

3. **Configurez les actions :**
```tsx
const actions: TableAction<MonEntity>[] = [
  {
    label: 'Voir',
    icon: Eye,
    onClick: (item) => handleView(item),
    variant: 'primary'
  }
];
```

4. **Utilisez le DataTable :**
```tsx
<DataTable
  data={data}
  columns={columns}
  actions={actions}
  title="Ma Liste"
/>
```

## 🎨 Personnalisation

### Couleurs des Badges
- `success` : Vert (Actif, Approuvé)
- `warning` : Jaune (En attente, Maintenance)
- `danger` : Rouge (Inactif, Rejeté)
- `info` : Bleu (Information)

### Tailles des Composants
- `sm` : Petit
- `md` : Moyen (par défaut)
- `lg` : Grand

## 🐛 Résolution de Problèmes

### Erreur "Only plain objects can be passed"
✅ **Résolu !** Tous les layouts sont maintenant des Client Components.

### Erreur de Permission
- Vérifiez que l'utilisateur a le bon rôle
- Consultez `/unauthorized` pour les détails

### Problème de Navigation
- Chaque rôle a ses routes autorisées
- La redirection se fait automatiquement

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez la console du navigateur
2. Consultez les logs du serveur
3. Vérifiez les permissions utilisateur
4. Redémarrez l'application si nécessaire

---

**Votre plateforme e-GMC est maintenant prête à être utilisée avec tous ses composants réutilisables ! 🎉**

