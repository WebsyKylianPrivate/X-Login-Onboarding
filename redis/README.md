# Redis Service

Service Redis pour X Login Onboarding.

## Installation

```bash
npm install
```

## Scripts

```bash
npm run dev    # Développement avec hot-reload
npm run start  # Démarrer le service
```

## Configuration

Variables d'environnement :

- `REDIS_HOST` (défaut: localhost)
- `REDIS_PORT` (défaut: 6379)
- `REDIS_PASSWORD` (optionnel)
- `REDIS_DB` (défaut: 0)

## Démarrage de Redis

Avant de lancer le service, assurez-vous que Redis est démarré :

**macOS (Homebrew):**

```bash
brew install redis
brew services start redis
# ou
redis-server
```

**Docker:**

```bash
docker run -p 6379:6379 redis
```

**Linux:**

```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

## Utilisation

Le client Redis est exporté depuis `redis/src/client.ts` et peut être utilisé dans le serveur si nécessaire.
