# Configuration de développement {#development-setup}

## Conditions préalables {#prerequisites}

- Docker / Docker Compose
- Node.js >=24.12.0
- pnpm >=10.24.0
- SQLite3

## Étapes {#steps}

1. Cloner le référentiel :

```bash
git clone https://github.com/wsj-br/duplistatus.git
cd duplistatus
```

2. Installer les dépendances (Debian/Ubuntu) :

```bash
sudo apt update
sudo apt install sqlite3 git -y
```

3. Supprimer les anciennes installations de Node.js (si vous l'aviez déjà installé)

```bash
sudo apt-get purge nodejs npm -y
sudo apt-get autoremove -y
sudo rm -rf /usr/local/bin/npm 
sudo rm -rf /usr/local/share/man/man1/node* 
sudo rm -rf /usr/local/lib/dtrace/node.d
rm -rf ~/.npm
rm -rf ~/.node-gyp
sudo rm -rf /opt/local/bin/node
sudo rm -rf /opt/local/include/node
sudo rm -rf /opt/local/lib/node_modules
sudo rm -rf /usr/local/lib/node*
sudo rm -rf /usr/local/include/node*
sudo rm -rf /usr/local/bin/node*
```

4. Installer Node.js et pnpm :

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
npm install -g pnpm npm-check-updates doctoc
```

5. Démarrer le serveur de développement :

Pour le port TCP par défaut (8666) :

```bash
pnpm dev
```

## Scripts disponibles {#available-scripts}

Le projet inclut plusieurs scripts npm pour différentes tâches de développement :

### Scripts de développement {#development-scripts}

- `pnpm dev` - Démarrer le serveur de développement sur le port 8666 (inclut des pré-vérifications)
- `pnpm build` - Construire l'application pour la production (inclut des pré-vérifications)
- `pnpm lint` - Exécuter ESLint pour vérifier la qualité du code
- `pnpm typecheck` - Exécuter la vérification de type TypeScript
- `scripts/upgrade-dependencies.sh` - Mettre à niveau tous les packages vers la dernière version, vérifier les vulnérabilités et les corriger automatiquement
- `scripts/clean-workspace.sh` - Nettoyer l'espace de travail

**Note :** Le script `preinstall` applique automatiquement pnpm comme gestionnaire de packages.

### Scripts de production {#production-scripts}

- `pnpm build-local` - Construire et préparer pour la production locale (inclut des pré-vérifications, copie les fichiers statiques dans le répertoire autonome)
- `pnpm start-local` - Démarrer le serveur de production localement (port 8666, inclut des pré-vérifications). **Note :** Exécutez d'abord `pnpm build-local`.
- `pnpm start` - Démarrer le serveur de production (port 9666)

### Scripts Docker {#docker-scripts}

- `pnpm docker-up` - Démarrer la pile Docker Compose
- `pnpm docker-down` - Arrêter la pile Docker Compose
- `pnpm docker-clean` - Nettoyer l'environnement Docker et le cache
- `pnpm docker-devel` - Construire une image Docker de développement étiquetée comme `wsj-br/duplistatus:devel`

### Scripts du service Cron {#cron-service-scripts}

- `pnpm cron:start` - Démarrer le service cron en mode production
- `pnpm cron:dev` - Démarrer le service cron en mode développement avec surveillance des fichiers (port 8667)
- `pnpm cron:start-local` - Démarrer le service cron localement pour les tests (port 8667)

### Scripts de test {#test-scripts}

- `pnpm generate-test-data` - Générer des données de sauvegarde de test (nécessite le paramètre --servers=N)
- `pnpm show-overdue-notifications` - Afficher le contenu des notifications en retard
- `pnpm run-overdue-check` - Exécuter la vérification des retards à une date/heure spécifique
- `pnpm test-cron-port` - Tester la connectivité du port du service cron
- `pnpm test-overdue-detection` - Tester la logique de détection des sauvegardes en retard
- `pnpm validate-csv-export` - Valider la fonctionnalité d'exportation CSV
- `pnpm set-smtp-test-config` - Définir la configuration de test SMTP à partir des variables d'environnement (voir [Scripts de test](test-scripts))
- `pnpm test-smtp-connections` - Tester la compatibilité croisée du type de connexion SMTP (voir [Scripts de test](test-scripts))
- `pnpm test-entrypoint` - Tester le script de point d'entrée Docker en développement local (voir [Scripts de test](test-scripts))
- `pnpm take-screenshots` - Prendre des captures d'écran pour la documentation (voir [Outils de documentation](documentation-tools))
