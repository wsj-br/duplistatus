---
translation_last_updated: '2026-02-05T00:20:49.903Z'
source_file_mtime: '2026-01-29T17:58:29.895Z'
source_file_hash: 5182562d16f18184
translation_language: fr
source_file_path: installation/https-setup.md
---
# Configuration HTTPS (Optionnel) {#https-setup-optional}

Pour les déploiements en production, il est recommandé de servir **duplistatus** via HTTPS en utilisant un proxy inverse. Cette section fournit des exemples de configuration pour les solutions de proxy inverse populaires.

### Option 1 : Nginx avec Certbot (Let's Encrypt) {#option-1-nginx-with-certbot-lets-encrypt}

[Nginx](https://nginx.org/) est un serveur web populaire qui peut agir en tant que proxy inverse, et [Certbot](https://certbot.eff.org/) fournit des certificats SSL gratuits de Let's Encrypt.

**Conditions préalables :**

- Nom de domaine pointant vers votre serveur
- Nginx installé sur votre système
- Certbot installé pour votre système d'exploitation

**Étape 1 : Installer Nginx et Certbot**

Pour Ubuntu/Debian :

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

    location / {
        proxy_pass http://localhost:9666;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Étape 3 : Activer le site et obtenir un certificat SSL**

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/duplistatus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

Certbot mettra automatiquement à jour votre configuration Nginx pour inclure les paramètres SSL et rediriger HTTP vers HTTPS.

**Documentation :**

- [Documentation Nginx](https://nginx.org/en/docs/)
- [Documentation Certbot](https://certbot.eff.org/instructions)
- [Documentation Let's Encrypt](https://letsencrypt.org/docs/)

### Option 2 : Caddy {#option-2-caddy}

[Caddy](https://caddyserver.com/) est un serveur web moderne avec HTTPS automatique qui simplifie la gestion des certificats SSL.

**Conditions préalables :**

- Nom de domaine pointant vers votre serveur
- Caddy installé sur votre système


**Étape 1 : Installer Caddy**


Suivez le [guide d'installation officiel](https://caddyserver.com/docs/install) pour votre système d'exploitation.

**Étape 2 : Créer un Caddyfile**

Créez un `Caddyfile` avec le contenu suivant :

```caddy
your-domain.com {
    reverse_proxy localhost:9666
}
```

**Étape 3 : Exécuter Caddy**

```bash
sudo caddy run --config Caddyfile
```

Ou l'utiliser comme service système :

```bash
sudo caddy start --config Caddyfile
```

Caddy obtiendra et gérera automatiquement les certificats SSL auprès de Let's Encrypt.

**Documentation :**

- [Documentation Caddy](https://caddyserver.com/docs/)
- [Guide Caddy Reverse Proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)

### Notes Importantes {#important-notes}

```bash
--send-http-url=https://your-domain.com/api/upload
```

:::info[IMPORTANT]
Après avoir configuré HTTPS, n'oubliez pas de mettre à jour la configuration de votre serveur Duplicati pour utiliser l'URL HTTPS :

:::

:::tip

- Remplacez `your-domain.com` par votre nom de domaine réel
- Assurez-vous que l'enregistrement DNS A de votre domaine pointe vers l'adresse IP de votre serveur
- Les deux solutions renouvelleront automatiquement les certificats SSL
- Envisagez de configurer un pare-feu pour autoriser uniquement le trafic HTTP/HTTPS
:::
