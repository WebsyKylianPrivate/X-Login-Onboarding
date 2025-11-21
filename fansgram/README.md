# Lucid Dreams Mini App - Telegram WebView

Une mini-app Telegram simple qui reproduit l'interface montrée dans l'image de référence.

## 🚀 Fonctionnalités

- ✨ Interface utilisateur moderne et responsive
- 💎 Système de ressources (diamants et énergie)
- 🛍️ Système d'achat d'items
- 🎨 Onglets pour différentes catégories
- 📱 Navigation en bas d'écran
- 🔄 Intégration complète avec Telegram WebApp API
- 🎮 Retour haptique pour une meilleure UX

## 📦 Structure des fichiers

```
├── index.html      # Page HTML principale
├── style.css       # Styles et design
├── app.js          # Logique de l'application
└── README.md       # Documentation
```

## 🔧 Installation

### Option 1 : Hébergement local pour test

1. Installez un serveur HTTP simple :
```bash
npm install -g http-server
```

2. Lancez le serveur :
```bash
http-server -p 8080
```

3. Ouvrez votre navigateur sur `http://localhost:8080`

### Option 2 : Hébergement en ligne (pour Telegram)

1. Hébergez les fichiers sur un serveur HTTPS (obligatoire pour Telegram)
   - GitHub Pages
   - Vercel
   - Netlify
   - Cloudflare Pages

2. Créez un bot Telegram avec [@BotFather](https://t.me/BotFather)

3. Configurez la Mini App :
```
/newapp
# Suivez les instructions et fournissez l'URL HTTPS de votre app
```

## 🎮 Utilisation

### Dans un navigateur web
- Cliquez sur le bouton "+" pour ajouter 100 diamants (mode test)
- Cliquez sur "Unlock" pour débloquer des items
- Changez d'onglet entre "Appearance" et "Items"

### Dans Telegram
- Ouvrez votre bot Telegram
- Lancez la mini app
- Le bouton "Back" fermera l'application
- Les retours haptiques fonctionneront automatiquement

## 🛠️ Personnalisation

### Ajouter de nouveaux items

Modifiez le tableau `items` dans `app.js` :

```javascript
const items = [
    {
        id: 4,
        name: 'Nom de l\'item',
        price: 100,
        image: '🎭', // Émoji ou image
        category: 'appearance' // ou 'items'
    }
];
```

### Modifier les couleurs

Dans `style.css`, changez les couleurs principales :
- Background : `#000` (noir)
- Accent : `#7c3aed` à `#a855f7` (violet/purple)
- Texte : `#fff` (blanc)

### Ajuster les ressources de départ

Dans `app.js`, modifiez l'objet `userData` :

```javascript
let userData = {
    diamonds: 500,  // Nombre de diamants initial
    energy: 100,
    maxEnergy: 100,
    unlockedItems: []
};
```

## 📱 Compatibilité

- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Telegram iOS
- ✅ Telegram Android
- ✅ Desktop browsers

## 🔒 Note importante

Cette application est un prototype d'interface utilisateur. Pour une version production :

1. Ajoutez un backend pour sauvegarder les données
2. Implémentez une authentification sécurisée
3. Ajoutez un système de paiement réel
4. Gérez les états de chargement et d'erreur
5. Ajoutez des images réelles au lieu d'émojis

## 📄 Licence

Libre d'utilisation pour vos projets personnels et commerciaux.

