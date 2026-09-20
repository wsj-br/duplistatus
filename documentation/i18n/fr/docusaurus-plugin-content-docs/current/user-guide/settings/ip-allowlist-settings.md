# Liste d'adresses IP autorisées {/* #ip-allowlist */}

Les administrateurs peuvent restreindre l'accès à l'interface d'administration et aux API de données externes. Les deux listes sont indépendantes. Les deux sont désactivées par défaut.

![Liste d'adresses IP autorisées](../../assets/screen-settings-ip-allowlist.png)

L'application lit l'adresse du pair TCP à partir d'un en-tête interne défini par `scripts/peer-ip.cjs`. Un client ne peut pas falsifier cet en-tête. **IP détectée** affiche le **IP du pair** TCP et l'**IP autorisée** utilisée pour les décisions d'accès (elles correspondent sauf si les en-têtes de proxy de confiance s'appliquent).

Les requêtes refusées renvoient un code HTTP 403 (`IP_NOT_ALLOWED` sur les chemins d'API). Elles ne sont pas écrites dans le journal d'audit. Une ligne `console.warn` limitée par débit est émise vers la sortie standard de l'application (par exemple `docker logs`) — au maximum une entrée par IP cliente et par surface (admin, externe ou sonde) par minute, et dix par heure — afin que les scanners ne puissent pas submerger les journaux.

## Proxies de confiance {/* #trusted-proxies */}

Activez **Faire confiance aux en-têtes de proxy inverse** uniquement lorsque duplistatus n'est accessible que via un proxy inverse qui **remplace** `X-Forwarded-For` / `X-Real-IP` (ne pas ajouter). Ajoutez chaque CIDR de proxy avec **Ajouter** (ou collez une liste séparée par des virgules ou des retours à la ligne). Les entrées apparaissent sous forme de pastilles supprimables. Lorsque le pair TCP n'est pas dans cette liste, les en-têtes transférés sont ignorés.

## Interface d'administration {/* #admin-interface */}

Lorsqu'elle est activée, les pages, la connexion, les API CSRF et de session n'acceptent que les CIDR listés. Ajoutez des entrées avec **Ajouter** ; votre **IP autorisée** actuelle est marquée **IP actuelle** lorsqu'elle figure dans la liste. **127.0.0.1** et **::1** sont inclus par défaut et ne peuvent pas être supprimés. **Ajouter l'IP actuelle** et **IP de connexion récente de l'administrateur** (du journal d'audit) proposent des suggestions rapides. Vous ne pouvez pas activer cette liste à moins que votre IP actuelle ne soit déjà incluse (ou que vous vous connectiez depuis la boucle locale). Un verrouillage peut être récupéré avec :

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

ou en ajoutant votre CIDR à `ADMIN_IP_ALLOWLIST`. Les étapes complètes de récupération (recréation Docker, puis correction des paramètres et suppression de la substitution) sont décrites dans [Verrouillé par la liste d'adresses IP autorisées](../troubleshooting.md#locked-out-by-ip-allowlist).

## API externes {/* #external-apis */}

Lorsqu'elle est activée, `/api/upload`, `/api/summary` et `/api/lastbackup*` n'acceptent que les CIDR listés.

`/api/health` et `/api/ping` ne figurent pas seuls sur la liste externe (le ping du tableau de bord provient de l'IP de l'interface admin). Lorsque **l'une ou l'autre** liste d'autorisation est activée, ces sondes acceptent la boucle locale (`127.0.0.1`, `::1`) et les CIDR provenant de la liste **admin ou externe**. Les IP non listées reçoivent un code HTTP 403. Lorsque les deux listes sont désactivées, les sondes restent publiques.

Les requêtes de sonde non locales sont également limitées par débit (HTTP 429, `PROBE_RATE_LIMITED`) : `/api/ping` 60 par minute et 600 par heure ; `/api/health` 30 par minute et 120 par heure. Les vérifications Docker dans le conteneur accèdent à localhost et ne sont jamais limitées. Les limites au niveau de l'application ne stoppent pas une attaque massive par connexion ; placez cela sur le proxy inverse.

Cette liste constitue la protection à utiliser lorsque les clés API ne sont pas requises. Ajoutez des CIDR sous forme de pastilles comme dans la liste admin. **127.0.0.1** et **::1** sont inclus par défaut et ne peuvent pas être supprimés. Les **IP sources récentes de téléchargement** du journal d'audit sont proposées comme suggestions rapides.

Si cette liste d'autorisation et les clés API sont toutes deux requises, une requête doit passer **les deux**.

## Substitutions d'environnement {/* #environment-overrides */}

| Variable | Objectif |
|----------|---------|
| `IP_TRUSTED_PROXIES` | CIDR de proxy de confiance séparés par des virgules (implique également trust-proxy) |
| `ADMIN_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `ADMIN_IP_ALLOWLIST` | CIDR séparés par des virgules |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDR séparés par des virgules |

Les valeurs d'environnement remplacent la base de données, ainsi un verrouillage peut être récupéré sans l'interface utilisateur.
