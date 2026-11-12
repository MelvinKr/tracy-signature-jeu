# Tracy Signature – le jeu

Clicker en pixel art pour le salon Signature Cut by Tracy (Pau). On coiffe des clients en touchant l'écran,
on encaisse, on débloque les prestations du salon et on collectionne 30 coupes.
Pensé pour téléphone en portrait, jouable aussi sur ordinateur.

## État : V1 démo

Site statique (HTML, CSS, JS), sans serveur ni image : tout le pixel art est dessiné par code dans `app.js`
sur un canvas de 96 x 104 pixels. La partie est sauvegardée sur le téléphone (`localStorage`).
Il n'y a pas encore de classement partagé.

## Données du salon

Prestations, prix, durées, horaires, adresse et téléphone viennent de la fiche Planity du salon
(consultée le 12/11/2026). Ils sont regroupés en haut de `app.js` dans `SALON` et `SERVICES`.
Les coûts de déblocage, les outils et les 30 coupes de la collection sont propres au jeu.

## Lancer en local

Ouvrir `index.html` dans un navigateur.

## Déploiement

Netlify, branche `main`, dossier publié : la racine (voir `netlify.toml`).

## Suite prévue

- Classement partagé pour le concours (Netlify Functions + Blobs), avec contrôle des scores côté serveur.
- SIRET et mentions du jeu concours.
- Sons, équilibrage, sprites plus détaillés.
