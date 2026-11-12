# Signature Cut by Tracy – le jeu

Clicker pour le salon Signature Cut by Tracy (Pau). On coiffe des clients en touchant l'écran, on encaisse,
on débloque les prestations du salon, on collectionne 30 coupes et on gagne un code de réduction.
Pensé pour téléphone en portrait, adapté aux tablettes et aux ordinateurs.

## État : V2

Site statique (HTML, CSS, JS), sans serveur. Le personnage, les coupes et le décor sont dessinés en vectoriel
sur un canvas (`app.js`), nets sur tous les écrans. La partie est sauvegardée sur l'appareil (`localStorage`).

## Réglages (en haut de `app.js`)

- `SALON`, `SERVICES` : adresse, horaires, prestations, prix et durées, repris de la fiche Planity du salon (12/11/2026).
- `REWARD` : niveau à atteindre, temps de jeu minimum, montant et conditions du code de réduction. **À valider avec Tracy.**
- `XP0` et `xpNeed` : vitesse des niveaux. Réglage actuel : niveau 12 en 15 à 20 minutes selon la vitesse de clic.
- `CUTS`, `TOOLS` : coupes de la collection et améliorations, propres au jeu.

## Images (`img/`)

- `logo.jpg` et `real1.jpg` à `real5.jpg` : logo et réalisations, repris de la fiche Planity du salon.
- `tracy.jpg` (à ajouter) : photo de Tracy, affichée en haut de l'onglet Salon si le fichier existe.

## Code de réduction

Le code (`TS-XXXX-YY`) est généré sur l'appareil du joueur et contient une clé de contrôle. L'onglet Salon propose
« Vérifier un code » pour Tracy. Le dépôt étant public, cette vérification n'est pas inviolable : elle écarte
les codes inventés au hasard, pas un tricheur qui lit le code source.

## Lancer en local

Ouvrir `index.html` dans un navigateur.

## Déploiement

Netlify, branche `main`, dossier publié : la racine (voir `netlify.toml`).
