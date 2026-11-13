# Signature Cut by Tracy – le jeu

Clicker pour le salon Signature Cut by Tracy (Pau). On coiffe des clients en touchant l'écran, on encaisse,
on débloque les prestations du salon, on fait grandir son salon et on gagne un code de réduction.
Pensé pour téléphone en portrait, adapté aux tablettes et aux ordinateurs.

## État : V9

Site statique (HTML, CSS, JS), sans serveur. Le personnage, les coupes et le décor sont dessinés en vectoriel
sur un canvas (`app.js`), nets sur tous les écrans. La partie est sauvegardée sur l'appareil (`localStorage`).

Nouveautés de la V3 :

- **Univers de clientèle** : Quartier, Centre-ville, Affaires, Créateurs, Stars, Légendes. On change d'univers avec
  les gains cumulés. Les clients arrivent dans leur tenue (t-shirt, chemise, costume, t-shirt de créateur, chaînes
  et boucles en diamant, sourire en diamant) ; le décor change de couleur et gagne des projecteurs.
- **Activités** : chaque prestation se déroule en étapes (shampoing, coupe, barbe, massage crânien, soin visage,
  lotion et coiffage), avec des mains, des outils, des effets et des sons différents.
- **Ambiance** : lampes qui se balancent, enseigne qui tourne, néon, poussières dans la lumière, musique générée
  par le navigateur (aucun fichier audio). Le bouton son alterne musique + effets, effets seuls, muet.
- **Vente de produits** : parfois un client hésite, une bulle apparaît quelques secondes ; la toucher fait la vente.
  L'historique est dans l'onglet « Mon salon ».
- **Fauteuils** : jusqu'à 4 fauteuils d'équipe qui encaissent tout seuls.

Nouveautés de la V4 :

- **Personnalités** : 14 clients spéciaux à collectionner (héros de manga, patron de la tech, rappeur, magnat à
  monocle, robot IA, catcheur masqué…). Ils paient x4. Ce sont des archétypes **originaux** : aucune personne
  réelle ni personnage existant n'est reproduit (droit à l'image, droit d'auteur), le jeu étant la promotion d'un commerce.
- **Billets verts** à chaque encaissement, vente et défi réussi.
- **Turbo** : rythme au maximum = gains x2 pendant 6 secondes.
- **Clic maintenu** : un outil à acheter qui clique tout seul tant qu'on reste appuyé (2 à 8 clics par seconde).
- **Défis** : trois objectifs en cours, récompense à encaisser.
- **Panneau** : jauges d'achat sur chaque ligne, pastilles sur les onglets, onglet Album (personnalités + coupes).

Nouveautés de la V5 :

- **Pseudo et classement** : bouton 🏆 en haut. Le score est le total des gains cumulés. Le classement est
  partagé entre tous les joueurs grâce à une fonction Netlify (`netlify/functions/scores.mjs`, route `/api/scores`)
  qui stocke pseudo, score et niveau dans Netlify Blobs. Aucune autre donnée n'est collectée.
  Pour repartir de zéro (nouveau concours), changer `SEASON` dans `app.js`.
  Limite : le score est envoyé par le navigateur (voir le contrôle ajouté en V6). Les pseudos ne sont ni uniques
  ni modérés.
- **Sons** : caisse enregistreuse et billets à chaque encaissement. Pas de voix (essai retiré).

Nouveautés de la V6 (fichier `plus.js`, branché sur `app.js` par l'objet `X`) :

- **Concours** : encart avec les dates, le temps restant et les lots, dans le classement, l'onglet Infos et l'écran
  d'accueil. Dates et lots dans `CONTEST` (`app.js`). **Dates et lots à valider avec Tracy.**
- **Bonus du jour et roue** : un cadeau par jour, plus gros si on revient plusieurs jours de suite (jusqu'au 7e),
  et un lancer de roue par jour (onglet Outils).
- **Gains hors ligne** : l'équipe encaisse pendant l'absence, à moitié régime, 4 heures au plus.
- **Franchise** : arrivé dans l'univers Légendes, on peut ouvrir un salon dans une autre ville (Pau, Biarritz,
  Bayonne, Toulouse, Bordeaux, Lyon, Marseille, Paris). On repart de zéro avec des tarifs x3, x5, x7… ; les seuils
  des univers sont multipliés par 5 à chaque ville (`TIER_GROW`).
- **Événements** : heure de pointe, mariage, influenceur qui filme.
- **Coup parfait** : une jauge à la fin de certaines coupes ; bien visé, le client paie x1,5 ou x2.
- **Trophées** : 24 succès, +1 % sur les tarifs chacun ; le plus prestigieux sert de titre dans le classement.
- **Équipe** : chaque fauteuil a son coiffeur (prénoms inventés), à former sur 5 niveaux.
- **Décoration** : 6 objets visibles dans le salon, +3 % chacun, conservés de ville en ville.
- **Partage** du score, **installation** sur l'écran d'accueil (`manifest.webmanifest`, `sw.js`).
- **Classement** : le serveur refuse les scores impossibles pour le temps de jeu (plafond = 20 fois la courbe d'un
  joueur simulé à 10 clics par seconde). Cela écarte les faux scores grossiers, pas un tricheur appliqué.

Nouveautés de la V7 (`plus.js`) :

- **Trois gestes** : rasage au tracé (glisser le doigt sur une ligne, x1,6), la bonne coupe (reconnaître la coupe
  demandée parmi trois, x1,5), client difficile (toucher 8 cibles pendant qu'il gigote, x3).
- **Coloration** : un « bar à couleurs » à ouvrir dans Mon salon ; certains clients demandent alors une teinte
  (étape en plus, paiement x1,5). 12 teintes à collectionner dans l'album. Propre au jeu : ce n'est pas une
  prestation de la carte du salon.
- **Personnalités** : 28 au total, avec quatre raretés (Rare x4, Épique x8, Légendaire x20, Mythique x50) et des
  effets animés pour les plus rares (cadran qui tourne, peau étoilée, cheveux de flammes, or massif). Toujours des
  archétypes originaux ou du folklore, aucune personne réelle ni personnage protégé.
- **Noël** : du 1er décembre au 5 janvier, neige, guirlande, bonnets rouges et une personnalité de saison.
  Pour voir le thème hors saison : ajouter `?noel=1` à l'adresse.
- **Premiers pas** : cinq bulles guident les nouveaux joueurs (toucher, encaisser, acheter, carte, classement).

Nouveautés de la V8 :

- **Moins de texte** : les onglets Outils, Salon et Carte sont des grilles d'icônes (prix en pièces, pastille de
  niveau, jauge). L'explication de chaque icône apparaît dans une infobulle : appui long sur téléphone, survol à la
  souris. Les étapes de la prestation sont des icônes sur la barre de progression.
- **Monnaie** : le jeu compte en **Tracy coins** (symbole Ŧ, pièce marquée T). Les euros ne servent plus qu'aux vrais
  prix du salon (carte, tarifs, bulle de rendez-vous).
- **Rendez-vous** : après chaque client, une bulle « Prendre rendez-vous » (lien Planity, prestation et prix réel)
  s'affiche 6 secondes sans bloquer le jeu ; à chaque niveau, une fenêtre montre les dernières coupes réalisées, des
  réalisations du salon et un gros bouton Planity. « Ne plus afficher » coupe les deux définitivement (`S.noRdv`).
- **Coordonnées** : téléphone et adresse en permanence en haut de la scène (liens appel et plan).
- **Mains et ciseaux** : les ciseaux sont dessinés par-dessus la main (anneaux, pouce et doigts visibles).
- **Décor et effets** : mur de briques, lambris, grand miroir éclairé, vignette, onde dorée et confettis à
  l'encaissement, détails de visage (taches de rousseur, lunettes, grain de beauté, boucle d'oreille).
Nouveautés de la V9 (fichier `v9.js`, serveur `netlify/functions/game.mjs`, page `admin.html`) :

- **Parrainage** : lien personnel `/?r=CODE`. Quand le filleul a coiffé 5 clients, les deux reçoivent une prime.
  Limite : on peut tricher en se parrainant depuis un autre appareil ; l'enjeu n'est que des pièces du jeu.
- **Code du salon** : mot de la semaine (bonus une fois par mot, débloque « L'Ami du salon ») et **carte de
  fidélité** (codes à usage unique, 5 tampons). **La récompense réelle de la carte est à définir avec Tracy.**
- **Page de Tracy** (`/admin.html`) : fréquentation, mot de la semaine, création de tampons, classement complet avec
  retrait d'un pseudo, parrainages. Elle exige la variable d'environnement **`ADMIN_KEY`** dans Netlify
  (Site configuration → Environment variables), puis un redéploiement. Sans elle, la page répond « non réglée ».
- **Mesure d'audience anonyme** : compteurs par jour (visites, nouveaux joueurs, clics Planity, téléphone, plan,
  partages). Aucun identifiant ni cookie. Ordre de grandeur, pas comptabilité.
- **Carte avant / après** à chaque nouvelle coupe, avec le vrai prix et le bouton Planity, partageable en image.
- **Mode Chrono** : 60 secondes en partant de zéro, classement à part (saison `s1-chrono`), lien de défi `/?c=score`.
- **Icônes dessinées** (SVG) à la place des émojis sur les tuiles, les étapes et les onglets.
- **Mode enfant** (onglet Infos) : moins de texte, pas de lien de rendez-vous ; lecture des infobulles en option.
- **Tenue du coiffeur** (onglet Salon), **musique propre à chaque univers**, **reprise sur un autre appareil** par code.
- Correction : la boucle du jeu ne peut plus se figer après un retour sur l'onglet.
Mesure par simulation (10 clics par seconde, achats immédiats) : premier salon terminé en 10 min environ, le
deuxième en 9 min, le troisième en 19 min, puis de plus en plus long. Non vérifié avec de vrais joueurs.

## Ce qui est réel, ce qui est du jeu

- **Réel** (fiche Planity du salon, 12/11/2026) : adresse, horaires, prestations, prix et durées affichés,
  logo, photos de réalisations.
- **Propre au jeu** : les univers et leurs multiplicateurs, les produits vendus et leurs prix, les fauteuils,
  les outils, les 30 coupes de la collection. Les tenues et bijoux sont génériques : aucune marque n'est reproduite.

## Réglages (en haut de `app.js`)

- `SALON`, `SERVICES` : informations réelles du salon.
- `REWARD` : niveau à atteindre, temps de jeu minimum, montant et conditions du code. **À valider avec Tracy.**
- `XP0` et `xpNeed` : vitesse des niveaux.
- `TIERS`, `TIER_WORK`, `TIER_XP` : univers (seuil de gains, multiplicateur, exigence des clients).
- `SEATS`, `SEAT_TIME`, `PRODUCTS`, `TOOLS`, `CUTS` : croissance du salon et contenu du jeu.

Équilibrage mesuré par simulation (joueur qui achète dès qu'il peut) : le niveau 12 tombe vers 10 min à 8 clics
par seconde, 12 min à 5 clics par seconde, et le code n'est jamais donné avant 15 minutes de jeu actif.
Un joueur très lent (2 clics par seconde) met environ 30 minutes. Non vérifié avec de vrais joueurs.

## Images (`img/`)

- `logo.jpg` et `real1.jpg` à `real5.jpg` : logo et réalisations, repris de la fiche Planity du salon.
- `tracy.jpg` (à ajouter) : photo de Tracy, affichée en haut de l'onglet Infos si le fichier existe.

## Code de réduction

Le code (`TS-XXXX-YY`) est généré sur l'appareil du joueur et contient une clé de contrôle. L'onglet Infos propose
« Vérifier un code » pour Tracy. Le dépôt étant public, cette vérification n'est pas inviolable : elle écarte
les codes inventés au hasard, pas un tricheur qui lit le code source.

## Lancer en local

Ouvrir `index.html` dans un navigateur.

## Déploiement

Netlify, branche `main`, dossier publié : la racine (voir `netlify.toml`).
