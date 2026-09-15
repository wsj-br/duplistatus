# Liste d'adresses IP autorisées {/* #ip-allowlist */}

Les administrateurs peuvent restreindre qui peut accéder à l'interface d'administration et aux API de données externes. Les deux listes sont indépendantes. Les deux sont désactivées par défaut.

![Liste d'adresses IP autorisées](../../assets/screen-settings-ip-allowlist.png)

L'application lit l'adresse TCP du pair à partir d'un en-tête interne défini par `scripts/peer-ip.cjs`. Un client ne peut pas falsifier cet en-tête. **IP détectée** affiche l'**IP du pair** TCP et l'**IP autorisée** utilisée pour les décisions d'accès (elles correspondent sauf si les en-têtes de proxy de confiance s'appliquent).

Les requêtes refusées retournent HTTP 403 (`IP_NOT_ALLOWED` sur les chemins API). Elles ne sont pas écrites dans le journal d'audit. Une ligne `console.warn` limitée en taux est émise vers la sortie standard de l'application (par exemple `docker logs`) — au maximum une entrée par IP client et surface (admin, externe ou probe) par minute, et dix par heure — afin que les scanners ne puissent pas submerger les logs.

## Proxies de confiance {/* #trusted-proxies */}

Activez **Faire confiance aux en-têtes de proxy inverse** uniquement lorsque duplistatus n'est pas accessible sauf via un proxy inverse qui **écrase** `X-Forwarded-For` / `X-Real-IP` (ne pas ajouter). Ajoutez chaque CIDR de proxy avec **Ajouter** (ou collez une liste séparée par des virgules ou des sauts de ligne). Les entrées apparaissent sous forme de puces supprimables. Lorsque le pair TCP ne fait pas partie de cette liste, les en-têtes transférés sont ignorés.

## Interface d'administration {/* #admin-interface */}

Lorsque cette option est activée, les pages, les connexions, les API CSRF et de session n'acceptent que les CIDR listés. Ajoutez des entrées avec **Ajouter** ; votre **IP autorisée** actuelle est étiquetée **IP actuelle** lorsqu'elle est dans la liste. **127.0.0.1** et **::1** sont inclus par défaut et ne peuvent pas être supprimés. **Ajouter l'IP actuelle** et **IP de connexion récente de l'administrateur** (à partir du journal d'audit) offrent des suggestions rapides. Vous ne pouvez pas activer cette liste sauf si votre IP actuelle est déjà incluse (ou si vous vous connectez depuis la boucle locale). Un verrouillage peut être récupéré avec :

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

ou en ajoutant votre CIDR à `ADMIN_IP_ALLOWLIST`. Les étapes complètes de récupération (Docker recreate, puis corriger les Paramètres et supprimer le remplacement) sont dans [Verrouillé par la liste d'adresses IP autorisées](../troubleshooting.md#locked-out-by-ip-allowlist).

## API externes {/* #external-apis */}

Lorsque cette option est activée, `/api/upload`, `/api/summary`, et `/api/lastbackup*` n'acceptent que les CIDR listés.

`/api/health` et `/api/ping` ne sont pas seuls sur la liste externe (le ping du tableau de bord vient de l'IP de l'interface d'administration). Lorsque **l'une** des listes d'autorisation est activée, ces sondes acceptent la boucle locale (`127.0.0.1`, `::1`) et les CIDR de la **liste admin ou externe**. Les IP non listées reçoivent HTTP 403. Lorsque les deux listes sont désactivées, les sondes restent publiques.

Les requêtes de sondage non-loopback sont également limitées en taux (HTTP 429, `PROBE_RATE_LIMITED`) : `/api/ping` 60/minute et 600/heure ; `/api/health` 30/minute et 120/heure. Les vérifications Docker dans le conteneur touchent localhost et ne sont jamais limitées. Les limites au niveau de l'application ne stoppent pas une inondation de connexions volumétriques ; placez cela sur le proxy inverse.

Cette liste est la protection à utiliser lorsque les clés API ne sont pas requises. Ajoutez des CIDR comme des puces comme la liste admin. **127.0.0.1** et **::1** sont inclus par défaut et ne peuvent pas être supprimés. **IP sources récentes de téléchargement** à partir du journal d'audit sont offertes comme suggestions d'ajout rapide.

Si cette liste d'autorisation et les clés API sont toutes les deux requises, une requête doit passer **les deux**.

## Remplacements d'environnement {/* #environment-overrides */}

| Variable | But |
|----------|-----|
| `IP_TRUSTED_PROXIES` | CIDR de proxy de confiance séparés par des virgules (implique également trust-proxy) |
| `ADMIN_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `ADMIN_IP_ALLOWLIST` | CIDR séparés par des virgules |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDRs séparés par des virgules |

Les valeurs d'environnement remplacent la base de données, ce qui permet de récupérer un verrouillage sans utiliser l'interface utilisateur.
