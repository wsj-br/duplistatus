# Comment j'ai construit cette application en utilisant des outils d'IA {/* #how-i-build-this-application-using-ai-tools */}

# Motivation {/* #motivation */}

J'ai commencé à utiliser Duplicati comme outil de sauvegarde pour mes serveurs domestiques. J'ai essayé le [tableau de bord Duplicati](https://app.duplicati.com/) et [Duplicati Monitoring](https://www.duplicati-monitoring.com/), mais j'avais deux exigences principales : (1) auto-hébergé ; et (2) une API exposée pour l'intégration avec [Homepage](https://gethomepage.dev/), car je l'utilise pour la page d'accueil de mon laboratoire domestique.

J'ai également essayé de me connecter directement à chaque serveur Duplicati sur le réseau, mais la méthode d'authentification n'était pas compatible avec Homepage (ou je n'ai pas pu la configurer correctement).

Puisque j'expérimentais également avec des outils de code d'IA, j'ai décidé d'essayer d'utiliser l'IA pour construire cet outil. Voici le processus que j'ai utilisé...

# Outils utilisés {/* #tools-used */}

1. Pour l'interface utilisateur : [Google's Firebase Studio](https://firebase.studio/)
2. Pour l'implémentation : Cursor (https://www.cursor.com/)

:::note
J'ai utilisé Firebase pour l'interface utilisateur, mais vous pouvez également utiliser [v0.app](https://v0.app/) ou tout autre outil pour générer le prototype. J'ai utilisé Cursor pour générer l'implémentation, mais vous pouvez utiliser d'autres outils, comme VS Code/Copilot, Windsurf, ...
:::

# Interface utilisateur {/* #ui */}

J'ai créé un nouveau projet dans [Firebase Studio](https://studio.firebase.google.com/) et j'ai utilisé ce prompt dans la fonctionnalité "Prototype an app with AI" :

> Une application de tableau de bord web utilisant tailwind/react pour consolider dans une base de données sqllite3 les résultats de sauvegarde envoyés par la solution de sauvegarde duplicati en utilisant l'option --send-http-url (format json) de plusieurs machines, en gardant une trace du statut de la sauvegarde, de la taille, des tailles de téléchargement.
> 
> La première page du tableau de bord doit avoir un tableau avec la dernière sauvegarde de chaque machine sur la première page, y compris le nom de la machine, le nombre de sauvegardes stockées dans la base de données, le statut de la dernière sauvegarde, la durée (hh:mm:ss), le nombre d'avertissements et d'erreurs.
> 
> Lorsque vous cliquez sur une ligne de machine, affichez une page de détails de la machine sélectionnée avec une liste des sauvegardes stockées (paginées), y compris le nom de la sauvegarde, la date et l'heure de la sauvegarde, y compris depuis combien de temps, le statut, le nombre d'avertissements et d'erreurs, le nombre de fichiers, la taille des fichiers, la taille téléchargée et la taille totale du stockage. Incluez également dans la page de détails un graphique utilisant Tremor avec l'évolution des champs : taille téléchargée ; durée en minutes, nombre de fichiers examinés, taille des fichiers examinés. Le graphique doit tracer un champ à la fois, avec une liste déroulante pour sélectionner le champ souhaité à tracer. Le graphique doit également présenter toutes les sauvegardes stockées dans la base de données, et non seulement celles affichées dans le tableau paginé.
> 
> L'application doit exposer un point de terminaison d'API pour recevoir les messages POST du serveur duplicati et d'autres points de terminaison d'API pour récupérer tous les détails de la dernière sauvegarde d'une machine au format json.
> 
> Le design doit être moderne, réactif et inclure des icônes et autres aides visuelles pour faciliter la lecture. Le code doit être propre, concis et facile à maintenir. Utilisez des outils modernes comme pnpm pour gérer les dépendances.
> 
> L'application doit avoir un thème sombre et clair sélectionnable.
> 
> La base de données doit stocker ces champs reçus par le json de duplicati :

```json
"{ "Data": { "DeletedFiles": 0, "DeletedFolders": 0, "ModifiedFiles": 0, "ExaminedFiles": 15399, "OpenedFiles": 1861, "AddedFiles": 1861, "SizeOfModifiedFiles": 0, "SizeOfAddedFiles": 13450481, "SizeOfExaminedFiles": 11086692615, "SizeOfOpenedFiles": 13450481, "NotProcessedFiles": 0, "AddedFolders": 419, "TooLargeFiles": 0, "FilesWithError": 0, "ModifiedFolders": 0, "ModifiedSymlinks": 0, "AddedSymlinks": 0, "DeletedSymlinks": 0, "PartialBackup": false, "Dryrun": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "EndTime": "2025-04-21T23:46:38.3568274Z", "BeginTime": "2025-04-21T23:45:46.9712217Z", "Duration": "00:00:51.3856057", "WarningsActualLength": 0, "ErrorsActualLength": 0, "BackendStatistics": { "BytesUploaded": 8290314, "BytesDownloaded": 53550393, "KnownFileSize": 9920312634, "LastBackupDate": "2025-04-22T00:45:46+01:00", "BackupListCount": 6, "ReportedQuotaError": false, "ReportedQuotaWarning": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "BeginTime": "2025-04-21T23:45:46.9712252Z", "Duration": "00:00:00", "WarningsActualLength": 0, "ErrorsActualLength": 0 } }, "Extra": { "OperationName": "Backup", "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", "machine-name": "WSJ-SER5", "backup-name": "WSJ-SER5 Local files", "backup-id": "DB-2" } } "
```

Cela a généré un App Blueprint, que j'ai ensuite légèrement modifié (comme ci-dessous) avant de cliquer sur `Prototype this App` :

![appblueprint](/img/app-blueprint.png)

J'ai ensuite utilisé ces prompts pour ajuster et affiner le design et le comportement :

> Supprimez le bouton "Afficher les détails" de la page d'aperçu du tableau de bord et le lien sur le nom de la machine, si l'utilisateur clique n'importe où sur la ligne, la page de détails s'affichera.

> Lorsque vous présentez des tailles en octets, utilisez une échelle automatique (Ko, Mo, Go, To).

> Sur la page de détails, déplacez le graphique après le tableau. Changez la couleur du graphique en barres en une autre couleur compatible avec les thèmes clair et sombre.

> Sur la page de détails, réduisez le nombre de lignes pour présenter 5 sauvegardes par page.

> Sur le tableau de bord d'aperçu, ajoutez un résumé en haut avec le nombre de machines dans la base de données, le nombre total de sauvegardes de toutes les machines, la taille totale téléchargée de toutes les sauvegardes et le stockage total utilisé par toutes les machines. Incluez des icônes pour faciliter la visualisation.

> Veuillez persister le thème sélectionné par l'utilisateur. Ajoutez également des marges latérales et faites en sorte que l'interface utilisateur utilise 90% de la largeur disponible.

> dans la carte d'en-tête des détails de la machine, inclure un résumé avec le total des sauvegardes stockées pour cette machine, une statistique sur le statut de la sauvegarde, le nombre d'avertissements et d'erreurs de la dernière sauvegarde, la durée moyenne en hh:mm:ss, la taille totale téléchargée de toutes les sauvegardes et la taille de stockage utilisée basée sur les informations de la dernière sauvegarde reçue.

> rendre le résumé plus petit et plus compact pour réduire l'espace utilisé.

> lors de la présentation de la date de la dernière sauvegarde, afficher dans la même cellule, en police grise et petite, le temps écoulé depuis la sauvegarde (par exemple, il y a x minutes, il y a x heures, il y a x jours, il y a x semaines, il y a x mois, il y a x ans).

> dans le tableau de bord d'aperçu, placer la date de la dernière sauvegarde avant le statut de la dernière sauvegarde

Après avoir itéré sur ces invites, Firebase a généré le prototype tel qu'il est montré dans les captures d'écran ci-dessous :

![prototype](/img/screen-prototype.png)

![prototype-detail](/img/screen-prototype-detail.png)

:::note
Un point intéressant était que, dès la première interaction, Firebase Studio a généré des données aléatoires pour peupler les pages/graphiques, faisant fonctionner le prototype comme une application en direct.
:::

Après avoir terminé le prototype initial, j'ai accédé au code source en cliquant sur le bouton `</>` dans l'interface. J'ai ensuite utilisé l'extension Git pour exporter le code et le pousser vers un dépôt privé sur [GitHub](https://www.github.com).

# Backend {/* #backend */}

## Configuration {/* #setup */}

J'ai téléchargé le code depuis GitHub (en utilisant la commande `git clone`) dans un dossier local (dans mon cas, un Raspberry Pi 5 sous Linux) et installé les dépendances Node.js, npm et pnpm. Voir plus de détails dans [DEVELOPMENT.md](../development/setup.md).

J'ai configuré Cursor pour accéder au dossier de code depuis ma machine Windows en utilisant une connexion SSH.

J'ai copié un échantillon du JSON envoyé par Duplicati dans un fichier (voir le document [échantillon de rapport de sauvegarde](../api-reference/database-values)), en supprimant certains champs indésirables.

## Implémentation {/* #implementation */}

J'ai utilisé une invite initiale pour commencer l'implémentation, en me concentrant sur la persistance, les corrections et les nouvelles fonctionnalités. C'était un processus long mais très intéressant.

### Utilisation de l'IA pour générer l'invite {/* #using-ai-to-generate-the-prompt */}

J'ai créé une invite détaillée en utilisant Cursor Chat (mode `Manual`, modèle `Auto`) :

> améliorez ce texte en tant qu'invite pour l'outil Cursor AI afin de générer l'implémentation d'un prototype d'application :
> 
> veuillez créer un plan pour générer l'implémentation complète d'une application prototype Next.js à partir de cette base de code. Votre implémentation doit analyser en détail la base de code fournie pour maintenir les mêmes esthétiques visuelles, expérience utilisateur et flux de navigation. Pour le stockage des données, utilisez SQLite3. Générez la base de données et peuplez-la en utilisant la structure et le contenu trouvés dans le document [échantillon de rapport de sauvegarde](../api-reference/database-values), en intégrant pleinement chaque champ du JSON et en le persistants.

L'IA a généré l'invite suivante :

>Créer un plan d'implémentation complet pour un prototype d'application Next.js avec les exigences suivantes :
>
>1. Pile technologique :
>   - Next.js 14+ avec App Router
>   - TypeScript pour la sécurité des types
>   - SQLite3 pour la persistance des données
>   - TailwindCSS pour le style
>   - Composants de serveur React là où c'est approprié
>   - Composants clients pour les éléments interactifs
>
>2. Conception de la base de données :
>   - Analyser le document de rapport de sauvegarde d'exemple pour créer un schéma SQLite optimal
>   - Concevoir des tables pour stocker efficacement toutes les données de sauvegarde
>   - Inclure des index pour les requêtes courantes
>   - Implémenter la validation des données et la sécurité des types
>
>3. Structure de l'application :
>   - Implémenter l'interface utilisateur/expérience utilisateur exacte à partir de la base de code fournie
>   - Créer des composants réutilisables pour les éléments courants
>   - Configurer le routage approprié en utilisant App Router
>   - Implémenter des mises en page réactives
>   - Ajouter le support des thèmes sombre/clair
>
>4. Fonctionnalités principales :
>   - Tableau de bord avec aperçu de l'état des machines
>   - Vue détaillée de la machine avec historique des sauvegardes
>   - Visualisation des données à l'aide de graphiques
>   - Mises à jour en temps réel de l'état des sauvegardes
>   - Gestion appropriée des erreurs et des états de chargement
>
>5. Gestion des données :
>   - Créer des routes API pour les opérations de données
>   - Implémenter des stratégies efficaces de récupération des données
>   - Ajouter une validation des données appropriée
>   - Inclure la gestion des erreurs pour les opérations de base de données
>
>Veuillez fournir un plan d'implémentation détaillé qui couvre tous ces aspects tout en maintenant le design visuel et l'expérience utilisateur existants.

J'ai copié le prompt généré dans le presse-papiers.

### Commencer le voyage d'implémentation {/* #start-the-implementation-journey */}

J'ai créé une nouvelle conversation en cliquant sur le bouton `+`, j'ai basculé en mode `Agent`, et j'ai collé le prompt en utilisant Ctrl+Shift+V (en tant que texte).

Après la génération du plan, j'ai tapé `please, implement this plan` dans la conversation pour commencer l'implémentation.

:::note
Je n'ai inclus que le point de départ puisque je n'ai pas enregistré tous les prompts utilisés. Il y en avait beaucoup.
:::

# Notes {/* #notes */}

- Certains modèles peuvent se bloquer lors de la correction de bugs. "claude-3.5" et "claude-4" sont généralement meilleurs, mais parfois il faut essayer un autre modèle (GPT, Gemini, etc.).
Pour les bugs ou erreurs complexes, utilisez un prompt pour analyser les causes possibles de l'erreur au lieu de simplement demander à le corriger.
- Lors de modifications complexes, utilisez un prompt pour créer un plan, puis demandez à l'agent IA de l'implémenter. Cela fonctionne toujours mieux.
- Soyez précis lors de la modification du code source. Si possible, sélectionnez la partie pertinente du code dans l'éditeur et appuyez sur Ctrl+L pour l'inclure dans la conversation en tant que contexte.
- Incluez également une référence au fichier que vous mentionnez dans la conversation pour aider l'agent IA à se concentrer sur la partie pertinente du code et éviter de faire des modifications dans d'autres parties du code.
- J'ai tendance à anthropomorphiser l'agent IA, car il utilise persistamment 'nous', 'notre code' et 'voudriez-vous que je...'. C'est aussi pour améliorer mes chances de survie en cas (ou [quand](https://ai-2027.com/)) Skynet devient conscient et que le Terminator est inventé.
- Parfois, utilisez [Gemini](https://gemini.google.com/app), [Deepseek](https://chat.deepseek.com/), [ChatGPT](https://chat.openai.com/), [Manus](https://manus.im/app),... pour générer des prompts avec de meilleures instructions pour l'agent IA.
