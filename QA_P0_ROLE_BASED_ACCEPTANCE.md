# Q&A P0 - Role-Based Acceptance Checklist

Ce document sert de guide de validation fonctionnelle pour le lot P0:
- Q&A (questions/reponses/commentaires)
- moderation + acceptation
- anonymat
- notifications + deep-link
- confusion bridge

## 1) Pre-requis de test

- Backend et frontend demarres.
- Comptes disponibles:
  - `student`
  - `teacher`
  - `admin`
- Au moins 1 ressource publiee liee a un module.
- Notifications SSE actives.

## 2) Smoke rapide global

- [ ] Ouvrir `/discover/resources/:id/preview` (ressource liee a un module).
- [ ] Verifier affichage du bloc `Q&A Discussion`.
- [ ] Verifier affichage du bloc `Need extra help? Confusion signal`.

## 3) Scenarios STUDENT

### 3.1 Question anonyme
- [ ] Creer une question avec `Post this question anonymously` active.
- [ ] Verifier qu'un autre compte non-admin voit `Anonymous`/`Anonyme` au lieu du nom.

### 3.2 Reponse + commentaire
- [ ] Repondre a une question ouverte (>=10 caracteres).
- [ ] Ajouter un commentaire sur question (>=2 caracteres).
- [ ] Ajouter un commentaire sur reponse (>=2 caracteres).

### 3.3 Question fermee
- [ ] Tester sur une question `closed`.
- [ ] Verifier blocage de creation reponse/commentaires.

### 3.4 Confusion bridge
- [ ] Cliquer `I don't understand this yet` avec note vide.
- [ ] Re-tester avec note >=3 caracteres.
- [ ] Verifier retour succes + apparition de cas dans `My confusion cases for this resource`.

### 3.5 Notifications deep-link
- [ ] Recevoir notif Q&A.
- [ ] Cliquer notif depuis navbar.
- [ ] Verifier navigation vers preview avec query params.
- [ ] Verifier scroll/highlight sur question/reponse/commentaire cible.

## 4) Scenarios TEACHER

### 4.1 Reponse officielle
- [ ] Verifier presence champs:
  - `Official explanation (min 50 chars)`
  - `Concrete example (min 10 chars)`
- [ ] Verifier bouton `Post answer` bloque si contraintes non respectees.
- [ ] Poster une reponse valide et verifier badge `Official`.

### 4.2 Moderation
- [ ] Moderer question `Show/Hide/Delete`.
- [ ] Moderer reponse `Show/Hide/Delete`.
- [ ] Moderer commentaire `Show/Hide/Delete`.
- [ ] Verifier rafraichissement thread sans incoherence.

### 4.3 Acceptation
- [ ] Accepter une reponse.
- [ ] Verifier badge `Accepted`.
- [ ] Accepter une autre reponse de la meme question.
- [ ] Verifier qu'une seule reponse reste acceptee.

## 5) Scenarios ADMIN

- [ ] Verifier acces moderation identique teacher.
- [ ] Verifier acces acceptation identique teacher.
- [ ] Verifier rendu anonymat (admin peut voir l'auteur selon regle backend).

## 6) Deep-link matrix

- [ ] `?question=<id>` -> ouvre le thread correct.
- [ ] `?question=<id>&answer=<id>` -> met en avant la bonne reponse.
- [ ] `?question=<id>&comment=<id>` -> met en avant le bon commentaire.

## 7) Non-regression minimale

- [ ] Register redirige vers `/dashboard`.
- [ ] Empty state library redirige vers `/discover`.
- [ ] `npm run lint` sans erreur bloquante.
- [ ] `npm run build` OK.

## 8) Resultat attendu pour GO/NO-GO

- GO si:
  - tous les items critiques sections 3/4/5/6 sont valides,
  - aucune fuite anonymat,
  - aucune action non autorisee par role,
  - deep-link fiable.

- NO-GO si:
  - moderation/acceptation incoherente,
  - creation confusion indisponible pour student sur ressource liee module,
  - deep-link incorrect ou non deterministe.
