# 🧪 Guide de test local pour les deep links

## Méthodes de test

### Méthode 1 : Via l'URL query string (le plus simple)

Ouvrez votre application locale avec le paramètre `startapp` dans l'URL :

```
http://localhost:5173/?startapp=shop_trista
http://localhost:5173/?startapp=shop_mayumi
http://localhost:5173/?startapp=shop_noemie
```

L'application détectera automatiquement le paramètre et redirigera vers le shop correspondant.

### Méthode 2 : Via le mock dans mockEnv.ts

1. Ouvrez `mini-app/src/mockEnv.ts`
2. Décommentez la ligne suivante :
   ```typescript
   ['tgWebAppStartParam', 'shop_trista'],
   ```
3. Changez `shop_trista` par le slug que vous voulez tester
4. Rechargez l'application

### Méthode 3 : Via la console du navigateur

Ouvrez la console du navigateur et exécutez :

```javascript
// Simuler un start_param
window.Telegram = window.Telegram || {};
window.Telegram.WebApp = window.Telegram.WebApp || {};
window.Telegram.WebApp.initDataUnsafe = window.Telegram.WebApp.initDataUnsafe || {};
window.Telegram.WebApp.initDataUnsafe.start_param = 'shop_trista';

// Recharger la page
window.location.reload();
```

## Slugs disponibles

- `trista` → Shop Trista
- `mayumi` → Shop Mayumi
- `noemie` → Shop Noémie

## Test du bot en local

Pour tester le bot en local, vous pouvez utiliser ngrok ou un service similaire :

1. Exposez votre serveur local avec ngrok :
   ```bash
   ngrok http 3000
   ```

2. Configurez le webhook :
   ```bash
   curl -X POST http://localhost:3000/api/bot/set-webhook \
     -H "Content-Type: application/json" \
     -d '{"url": "https://votre-ngrok-url.ngrok.io"}'
   ```

3. Testez la commande `/invite trista` dans le bot

## Vérification

Pour vérifier que tout fonctionne :

1. Ouvrez l'application avec `?startapp=shop_trista`
2. Vous devriez voir dans la console : `🔗 start_param détecté: trista`
3. L'application devrait automatiquement afficher le shop "Trista" au lieu de la page d'accueil

