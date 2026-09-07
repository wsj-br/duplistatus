# Renforcement de la sécurité {/* #security-hardening */}

Le renforcement de la production pour **duplistatus** est en couches et optionnel. Chaque fonctionnalité décrite ici est désactivée par défaut, donc une installation fraîche continue de fonctionner jusqu'à ce que vous choisissiez de l'activer. Il y a trois couches indépendantes :

- **Clés API** — secrets étendus pour les API de téléchargement et de lecture externes ; généralement la première étape la plus facile dans un homelab
- **Listes d'adresses IP autorisées** — restrictions CIDR sur l'interface d'administration, les API externes ou les deux
- **Proxy inverse HTTPS** — trafic chiffré, avec le port `9666` gardé hors de l'internet public

## Ordre recommandé {/* #recommended-order */}

1. Gardez le port `9666` hors de l'internet public : liez l'application à localhost ou à un réseau privé.
2. Créez des [clés API](#api-keys) et activez **Exiger des clés API pour les API externes**. Cela fonctionne sans proxy inverse et est le gain le plus rapide.
3. Servez **duplistatus** via un [proxy inverse avec HTTPS](#https-with-a-reverse-proxy).
4. Ajoutez l'adresse TCP du pair du proxy à **Proxies de confiance** (ou `IP_TRUSTED_PROXIES`) si vous prévoyez d'utiliser des listes d'adresses IP autorisées.
5. Activez éventuellement les [listes d'adresses IP autorisées](#ip-allowlist) pour l'administration et les API externes, en utilisant l'**IP détectée** et les suggestions d'IP récentes pour éviter de vous verrouiller.

## Restreindre l'accès avec des clés API et des listes d'adresses IP autorisées {/* #restrict-access-with-api-keys-and-ip-allowlists */}

Ces deux fonctionnalités de Paramètres limitent qui peut atteindre le tableau de bord et les API de données externes. Elles sont indépendantes : lorsqu'elles sont toutes les deux activées, une requête doit passer **les deux** vérifications.

### Clés API {/* #api-keys */}

Les [clés API](../user-guide/settings/api-keys-settings.md) sont la protection la plus simple à ajouter, surtout dans un homelab. Créez des secrets étendus pour les téléchargements Duplicati et les widgets Homepage, puis exigez-les — aucun proxy inverse ou planification CIDR n'est nécessaire.

| Portée | Points de terminaison |
|-------|-----------|
| Télécharger | `POST /api/upload` |
| Lire | `GET /api/summary`, `GET /api/lastbackup/:id`, `GET /api/lastbackups/:id` |

Créez au moins une clé de téléchargement et une clé de lecture **avant** d'activer **Exiger des clés API pour les API externes**. Sinon, les téléchargements Duplicati et les widgets Homepage cessent de fonctionner dès que le commutateur est activé.

Duplicati ne peut pas inclure de headers personnalisés dans ses requêtes, donc vous devez fournir sa clé API en ajoutant `?api_key=…` à l'URL du rapport. Notez que l'utilisation de la chaîne de requête expose la clé API dans les journaux d'accès des reverse proxy. Pour les autres clients qui supportent les headers personnalisés, il est recommandé d'utiliser le header `X-Api-Key` ou le header `Authorization: Bearer` à la place pour une sécurité accrue.

La limite de taille de téléchargement et les limites de débit par IP sur la même page de Paramètres s'appliquent même lorsque les clés sont optionnelles. Les clés API protègent uniquement les API de données externes ; elles ne restreignent pas l'interface d'administration, qui est protégée par la connexion et, éventuellement, par la liste d'adresses IP autorisées pour l'administration.

### Liste d'adresses IP autorisées {/* #ip-allowlist */}

La [liste d'adresses IP autorisées](../user-guide/settings/ip-allowlist-settings.md) fournit deux listes CIDR séparées, toutes deux désactivées par défaut :

- **Interface d'administration** — pages, login, CSRF, et API de session
- **API externes** — `/api/upload`, `/api/summary`, et `/api/lastbackup*`
- **Santé et ping** — `/api/health` et `/api/ping` restent publics tant que les deux listes sont désactivées. Quand une des listes est sur, elles acceptent les boucles locales ainsi que les CIDRs de la liste admin **ou** externe, et les clients non-boucle locale sont soumis à une limitation de débit. Les limites au niveau de l'application ne stoppent pas une inondation de connexions volumétriques ; ajouter `limit_req` / Caddy `rate_limit` sur le reverse proxy si l'instance est accessible depuis internet.

Avant d'activer l'une de ces listes, vérifiez l'**IP détectée** sur **Paramètres → Liste d'adresses IP autorisées** et comparez l'**IP du pair** avec l'**IP de la liste d'adresses autorisées**. Utilisez **Ajouter l'IP actuelle** ou les suggestions d'IP récentes pour ne pas vous verrouiller. Les étapes de récupération sont dans [Verrouillé par la liste d'adresses IP autorisées](../user-guide/troubleshooting.md#locked-out-by-ip-allowlist).

Si **duplistatus** se trouve derrière un proxy inverse, configurez **Proxies de confiance** en premier (voir [Proxies de confiance pour les listes d'adresses IP autorisées](#trusted-proxies-for-ip-allowlists) ci-dessous). Sans cela, les décisions de liste d'adresses IP sont prises contre l'adresse du proxy plutôt que celle du client.

## HTTPS avec un proxy inverse {/* #https-with-a-reverse-proxy */}

Pour les déploiements de production, servez **duplistatus** via HTTPS derrière un proxy inverse. Les exemples ci-dessous couvrent deux options populaires.

### Option 1 : Nginx avec Certbot (Let's Encrypt) {/* #option-1-nginx-with-certbot-lets-encrypt */}

[Nginx](https://nginx.org/) est un serveur web largement utilisé qui peut agir comme un proxy inverse, et [Certbot](https://certbot.eff.org/) émet des certificats TLS gratuits de Let's Encrypt.

**Conditions préalables :**

- Un nom de domaine dont l'enregistrement DNS A (ou AAAA) pointe vers votre serveur
- Nginx installé sur votre système
- Certbot installé pour votre système d'exploitation

**Étape 1 : Installer Nginx et Certbot**

Sur Ubuntu/Debian :

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**Étape 2 : Créer la configuration Nginx**

Créer `/etc/nginx/sites-available/duplistatus` :

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Nginx defaults to 1 MB, which is below the upload limit on
    # Settings → API Keys (5 MB by default). Keep this at or above it.
    client_max_body_size 10m;

    location / {
        proxy_pass http://localhost:9666;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Cet exemple **écrase** `X-Forwarded-For` et `X-Real-IP` avec `$remote_addr`. Ne pas utiliser `$proxy_add_x_forwarded_for` à la place : il ajoute à ce que le client a envoyé, laissant des valeurs contrôlées par le client dans un en-tête sur lequel les listes d'adresses IP autorisées reposent.

**Étape 3 : Activer le site et obtenir le certificat**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain the TLS certificate
sudo certbot --nginx -d your-domain.com
```

Certbot ajoute les paramètres TLS à votre configuration Nginx et redirige HTTP vers HTTPS. Il installe également un minuteur de renouvellement, que vous pouvez vérifier avec :

```bash
sudo certbot renew --dry-run
```

**Documentation :**

- [Documentation Nginx](https://nginx.org/en/docs/)
- [Documentation Certbot](https://certbot.eff.org/instructions)
- [Documentation Let's Encrypt](https://letsencrypt.org/docs/)

### Option 2 : Caddy {/* #option-2-caddy */}

[Caddy](https://caddyserver.com/) est un serveur web moderne qui obtient et renouvelle automatiquement les certificats TLS, ce qui supprime la plupart des tâches de gestion des certificats.

**Conditions préalables :**

- Un nom de domaine dont l'enregistrement DNS A (ou AAAA) pointe vers votre serveur
- Caddy installé sur votre système


**Étape 1 : Installer Caddy**


Suivez le [guide d'installation officiel](https://caddyserver.com/docs/install) pour votre système d'exploitation.

**Étape 2 : Créer le Caddyfile**

Les installations de paquets lisent `/etc/caddy/Caddyfile`. Définissez son contenu sur :

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

La directive `reverse_proxy` de Caddy définit les en-têtes IP du client pour vous. Vous devez encore lister l'adresse TCP du pair du proxy sous **Proxies de confiance** lors de l'utilisation de listes d'adresses IP autorisées (voir [ci-dessous](#trusted-proxies-for-ip-allowlists)).

**Étape 3 : Démarrer ou recharger Caddy**

Si vous avez installé Caddy à partir d'un paquet, appliquez la configuration via le service géré :

```bash
sudo systemctl reload caddy
```

Pour exécuter Caddy manuellement à la place — par exemple à partir d'un Caddyfile dans le répertoire actuel — arrêtez d'abord le service géré pour libérer les ports 80 et 443, puis exécutez :

```bash
sudo caddy run --config Caddyfile
```

Caddy obtient le certificat la première fois qu'il sert le site et le renouvelle avant son expiration.

**Documentation :**

- [Documentation Caddy](https://caddyserver.com/docs/)
- [Guide Caddy Reverse Proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Proxies de confiance pour les listes d'adresses IP autorisées {/* #trusted-proxies-for-ip-allowlists */}

Lier **duplistatus** à localhost ou à un réseau privé afin que le reverse proxy soit le seul écouteur public. Le port `9666` ne doit jamais être accessible depuis Internet.

Quand les [listes d'adresses IP autorisées](../user-guide/settings/ip-allowlist-settings.md) sont activées, listez le proxy sous **Proxies de confiance** (ou définissez `IP_TRUSTED_PROXIES`). L'application honore `X-Forwarded-For` et `X-Real-IP` uniquement quand le pair TCP est un proxy de confiance ; sinon elle les ignore.

- Configurez le proxy pour **écraser** ces en-têtes avec l'adresse du client connecté, comme dans l'exemple Nginx ci-dessus. Ne pas ajouter.
- Quand le proxy s'exécute sur l'hôte et que **duplistatus** s'exécute dans un conteneur, l'**IP du pair** est généralement la passerelle Docker (par exemple `172.17.0.1`). Mettez cette adresse ou CIDR dans **Proxies de confiance**, et mettez les CIDR du client réel dans la liste d'adresses IP autorisées de l'admin ou externe.
- Avant d'activer une liste d'adresses IP autorisées, ouvrez **Paramètres → Liste d'adresses IP autorisées** et vérifiez **IP détectée** : l'**IP du pair** doit être le proxy (ou la passerelle Docker) et l'**IP de la liste d'adresses autorisées** doit être le client. Si l'IP de la liste d'adresses autorisées montre toujours le proxy, la configuration du proxy de confiance n'est pas encore correcte.

### Après avoir activé HTTPS {/* #after-enabling-https */}

```bash
--send-http-json-urls=https://your-domain.com/api/upload
```

:::info[IMPORTANT]
Mettez à jour votre configuration du serveur Duplicati pour utiliser l'URL HTTPS :


Ajoutez `?api_key=YOUR_UPLOAD_KEY` si des clés API sont requises. Sur Duplicati antérieur à 2.0.9.106, utilisez `--send-http-url=https://your-domain.com/api/upload` avec `--send-http-result-output-format=Json`. Voir [Configuration du serveur Duplicati](duplicati-server-configuration.md).
:::

:::tip

- Remplacez `your-domain.com` par votre propre domaine dans les exemples.
- Confirmez que l'enregistrement DNS A (ou AAAA) du domaine résout vers votre serveur avant de demander un certificat.
- Les deux options renouvellent les certificats automatiquement : Certbot via son minuteur systemd, Caddy via son gestionnaire de certificats intégré.
- Limitez le pare-feu de l'hôte au port 443, et gardez `80` et `9666` fermés à l'extérieur.
:::
