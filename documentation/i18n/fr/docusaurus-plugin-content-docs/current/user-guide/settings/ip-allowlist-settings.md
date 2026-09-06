# Liste d'adresses IP autorisées {#ip-allowlist}

Les administrateurs peuvent restreindre qui peut accéder à l'interface d'administration et aux API de données externes. Les deux listes sont indépendantes. Les deux sont désactivées par défaut.

![Liste d'adresses IP autorisées](../../assets/screen-settings-ip-allowlist.png)

L'application lit l'adresse du pair TCP à partir d'un en-tête interne défini par `scripts/peer-ip.cjs`. Un client ne peut pas falsifier cet en-tête. **IP détectée** affiche l'**IP du pair** et l'**IP autorisée** utilisées pour les décisions d'accès (elles correspondent sauf si les en-têtes de proxy de confiance s'appliquent).

## Proxies de confiance {#trusted-proxies}

Activez **Faire confiance aux en-têtes de proxy inverse** uniquement lorsque duplistatus n'est pas accessible sauf par un proxy inverse qui **écrase** `X-Forwarded-For` / `X-Real-IP` (ne pas ajouter). Ajoutez chaque CIDR de proxy avec **Ajouter** (ou collez une liste séparée par des virgules ou des sauts de ligne). Les entrées apparaissent sous forme de puces supprimables. Lorsque le pair TCP ne fait pas partie de cette liste, les en-têtes transférés sont ignorés.

## Interface d'administration {#admin-interface}

Quand activé, les pages, les connexions, les API CSRF et de session n'acceptent que les CIDR listés. Ajoutez des entrées avec **Ajouter** ; votre **IP autorisée** est marquée **IP actuelle** lorsqu'elle est dans la liste. **127.0.0.1** et **::1** sont inclus par défaut et ne peuvent pas être supprimés. **Ajouter l'IP actuelle** et les **IP de connexion récente de l'administrateur** (à partir du journal d'audit) offrent des suggestions rapides. Vous ne pouvez pas activer cette liste sauf si votre IP actuelle est déjà incluse (ou si vous vous connectez depuis la boucle locale). Un verrouillage peut être récupéré avec :

```bash
ADMIN_IP_ALLOWLIST_ENABLED=false
```

ou en ajoutant votre CIDR à `ADMIN_IP_ALLOWLIST`. Les étapes complètes de récupération (recreate Docker, puis corriger les Paramètres et supprimer le remplacement) sont dans [Verrouillé par la Liste d'adresses IP autorisées](../troubleshooting.md#locked-out-by-ip-allowlist).

## API externes {#external-apis}

Quand activé, `/api/upload`, `/api/summary`, et `/api/lastbackup*` acceptent uniquement les CIDR listés. `/api/health` et `/api/ping` restent ouverts afin que les vérifications de santé Docker et la sonde de connectivité continuent de fonctionner.

Cette liste est la protection à utiliser lorsque les clés API ne sont pas requises. Ajoutez des CIDR comme des puces comme la liste d'administration. **127.0.0.1** et **::1** sont inclus par défaut et ne peuvent pas être supprimés. Les **IP sources récentes de téléchargement** du journal d'audit sont proposées comme suggestions d'ajout rapide.

Si cette liste d'adresses IP autorisées et les clés API sont requises, une requête doit passer **les deux**.

## Remplacements d'environnement {#environment-overrides}

| Variable | But |
|----------|-----|
| `IP_TRUSTED_PROXIES` | CIDR de proxy de confiance séparés par des virgules (implique également trust-proxy) |
| `ADMIN_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `ADMIN_IP_ALLOWLIST` | CIDR séparés par des virgules |
| `EXTERNAL_API_IP_ALLOWLIST_ENABLED` | `true` / `false` |
| `EXTERNAL_API_IP_ALLOWLIST` | CIDR séparés par des virgules |

Les valeurs d'environnement remplacent la base de données afin qu'un verrouillage puisse être récupéré sans l'interface utilisateur.
