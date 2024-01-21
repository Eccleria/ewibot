# Frontalier.ères

**Combat entre le frontalier et Ewibot**

## Idée 1

série de manches type papier-caillou-ciseaux

Affrontement utilisant les termes : Attaque, Blocage, Esquive


Papier > Caillou
Caillou > Ciseau
Ciseau > Papier


## Idée 2

Chaque personne possède des points d'attaque et de défense
Chaque tour alterne

Pour que l'attaquant gagne, il faut que la valeur de son attaque se place hors de l'intervalle de défense du défenseur.
Ex : Défense entre [3, 8], si l'attaque est en dehors, l'attaquant gagne

## Idée 3

Chaque tour, tu dois jouer 1 ou 2 épées.
- Si NbEpéeA != NbEpéeB => A gagne
- Si NbEpéeA == NbEpéeB => 0 gagne

Les tours alternent.
Le premier à 3 victoires gagne


# Dessinateur.ices

## Défi de Créativité

### Description
Un.e dessinateurice peut en défier un.e autre sur le thème de la Créativité.
Lea instigateurice choisit un thème :
- Iel peut le proposer
- Iel peut demande à prendre un thème aléatoire dans ceux proposés par Ewibot.

Un message apparaît, permettant de prendre la proposition de chaque dessinateurice.

A la fin, un sondage est lancé pour permettre aux spectateurices de voter la meilleure proposition.

### Principe technique
Le défi est lancé par une commande, avec les options suivantes :
- _MentionableOption_ - choisir lea dessinateurice cible
- _StringOption_ - Remplir sa proposition
- **Idée pour le moment** _StringOption_ + _Choices_ : liste de thème succincts proposée par Ewibot, avec en premier _aléatoire_, pour permettre un choix précis.
- _NumberOption_ - durée du sondage pour le vote des propositions. Défaut : 1h

Un message mentionnant les 2 dessinateurices apparaît, avec un bouton.
Lorsqu'il est cliqué, une fenêtre modale apparaît.

Cette fenêtre modale indique le contenu du défi :
- Les règles du défi
- Le thème _succinct_
- La description du thème _précis_
- Un emplacement long pour écrire

Le Modal, une fois validé, est stocké en mémoire (à choisir entre db et client, pour éviter les crashs)

Lorsque les 2 Modaux sont validés, un sondage apparaît.
Le sondage contient :
- Auteurice (personne ayant lancé le défi)
- Titre : thème du défi (/!\\ taille /!\\)
- description : probablement le thème précis (/!\\ taille /!\\)
- (+) les champs standard des sondages (liste des choix, timestamp, footer)
La durée du sondage pourra être choisie lors du lancement du défi

A la cloture du sondage, le message de fin mentionne les 2 participant.es et indique lea gagnant.e.

### Notes

Un système de points ?

Des stats (nombre de défi, victoire) ?

Des "récompenses" ?


## Défi de la Volonté

### Description
Un.e dessinateurice peut en défier un.e autre sur le thème de la Volonté.
L'objectif est de voir qui se trompera en premier.e lors de la restitution d'une série de chiffres.

Ewibot envoie un message _ephemeral_ avec une série de chiffres grandissante.
Lea dessinateurice doit répondre en indiquant la série de chiffre qu'iel vient de voir.
La première personne à se tromper perd.

### Principe technique
Le défi peut se faire en décalé => stockage des données.
Une suite de chiffre est générée aléatoirement.
Elle est envoyée discrètement à la personne en train de participer.
Au bout d'un certain temps, le message _ephemeral_ est supprimé.

La personne doit répondre la série de chiffre. Plusieurs méthodes sont possibles avec avantages et inconvénients :
- Modal : série de chiffre inscrite dans un onglet à petit nombre de charatère.
    - Avantage : Très simple à remplir
    - Inconvénient : Eventuelle difficulté de gestion des fautes de frappe.
- Réactions : Les chiffres de 0 à 9 sont ajoutées en réaction à l'_ephemeral_. La personne réagit dans l'ordre d'apparition des chiffres. 
    - Attention à la gestion des chiffres apparaissant plusieurs fois 
    - Avantage : ludique
    - Inconvénient : temps de réponse plus long, risque de performances moindres, beaucoup d'appels à l'API
- Boutons : Utilisation de boutons pour répondre la suite de chiffres reçue.
    - Problème de stockage des réactions au fur et à mesure, risque de mélanger les réponses et d'avoir des faux négatifs.
    - Complexité de mise en oeuvre, beaucoup de post process, solution pas simple.

Le jeu s'arrête au bout de 10 listes, ou à la première erreur.
Les égalités sont possibles sans erreur. 
Difficulté de faire intervenir le temps sur ce genre de test, les problèmes de connexion ou Discord peuvent trop influer sur le résultat.

Le résultat est envoyé sour forme d'un message publique mentionnant les 2 participant.es

# Rêveur.ses

# Marchombres

## Défi de poésie


