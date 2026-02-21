# MUS Platform - Analyse, conception et architecture (version de reference)

## 1) But du document

Ce document sert de reference produit + technique pour la suite du projet MUS.

Il couvre:
- la vision fonctionnelle,
- les roles et permissions,
- la lecture du schema BD actuel (d'apres l'image du dossier `Database/Schema`),
- la conception des prochaines fonctionnalites,
- un plan de developpement par phases (sprints),
- la phase finale de test.

Ce document est fait pour preparer le passage en execution, sprint par sprint.

---

## 2) Vision produit MUS (resume)

MUS est une plateforme universitaire marocaine qui permet:
- le partage de ressources academiques,
- l'entraide entre etudiants (peer-to-peer),
- les contributions pedagogiques officielles des enseignants,
- la validation centrale par admin pour garantir la qualite et la conformite.

Probleme resolu:
- passer d'un partage limite WhatsApp (fichiers perdus, diffusion faible)
- a une diffusion structuree, validee et reutilisable par tous les etudiants concernes.

---

## 3) Roles et permissions (contrat metier)

## 3.1 Public (visiteur non connecte)

Peut:
- consulter les donnees publiques (catalogues, ressources publiees, certaines stats).

Ne peut pas:
- creer/modifier des ressources,
- ajouter des favoris,
- ajouter des notes (ratings),
- acceder aux routes protegees.


## 3.2 Student

Peut:
- creer des ressources (soumission selon workflow),
- gerer ses ressources selon le statut autorise,
- ajouter favoris,
- ajouter ratings,
- participer au Q&A (poser et repondre) dans les prochaines phases,
- signaler "Je ne comprends pas" dans les prochaines phases.

Ne peut pas:
- valider/rejeter/publier des ressources,
- gerer la structure academique,
- acceder aux routes admin.


## 3.3 Teacher

Peut:
- creer des ressources (validation admin),
- gerer ses ressources selon workflow,
- ajouter favoris,
- ajouter ratings,
- repondre Q&A en mode officiel (future phase),
- marquer reponse correcte dans son perimetre module (future phase),
- creer sessions de rattrapage (future phase).

Ne peut pas:
- publier/valider globalement (admin only),
- modifier les ressources des autres.


## 3.4 Admin

Peut:
- valider/rejeter/publier/archiver les ressources,
- gerer utilisateurs et roles,
- gerer structure academique,
- consulter les dashboards globaux,
- consulter les audit logs.

Regle metier demandee et validee:
- admin ne fait pas de rating,
- admin ne fait pas de favoris.

---

## 4) Workflow ressources (cycle de vie)

Cycle de statut:

`draft -> pending -> published`
`pending -> rejected -> draft`
`published -> archived`

Regles:
- `draft`: editable par createur.
- `pending`: gele pendant verification.
- `published`: visible publiquement selon droits; modification controlee.
- `rejected`: retour en draft avec raison.
- `archived`: retire de l'usage courant, conserve en historique.

Pourquoi admin valide seul:
- eviter publication de contenu non academique,
- proteger donnees sensibles,
- assurer qualite et coherence pedagogique.

---

## 5) Lecture du schema BD actuel (basee sur l'image)

Schema observe dans `Database/Schema/postgres - BD-mus.png`:

Tables coeur metier:
- `users`, `roles`, `user_roles`
- `domains`, `programs`, `institution_types`, `institutions`, `institution_programs`
- `levels`, `semesters`, `modules`
- `resources`, `resource_module_map`
- `favorites`, `ratings`, `resource_downloads`
- `student_profiles`, `user_settings`
- `audit_logs`, `password_reset_tokens`

Vues analytiques observees:
- `vw_my_favorites`
- `vw_admin_student_stats`
- `vw_admin_resource_performance`
- `vw_admin_dashboard_metrics`
- `vw_admin...` (plusieurs vues admin globales)

Relations majeures:
- user -> resources (`created_by`)
- user <-> role via `user_roles`
- resource <-> module via `resource_module_map`
- user <-> resource via `favorites` et `ratings`
- parcours academique: domain -> program -> level -> semester -> module

Convention ID:
- user: UUID
- entites academiques + contenu: integer/bigint

---

## 6) Composants securite et valeur ajoutee

## 6.1 audit_logs

Utilite:
- tracer les actions sensibles (qui, quoi, quand, sur quoi, pourquoi).

Valeur:
- securite,
- investigation,
- conformite,
- responsabilisation des actions admin.

Exemple:
- un admin consulte la liste des utilisateurs ayant mis une ressource en favori.
- action loggee avec `action`, `resource_id`, `reason`, `ip`, `user_agent`.


## 6.2 password_reset_tokens

Utilite:
- reset mot de passe securise par token temporaire.

Valeur:
- pas de reset direct dangereux,
- token expiration,
- invalidation apres usage,
- protection contre abus.

Exemple:
1) `POST /auth/forgot-password` avec email.
2) token genere et stocke (hash/token policy).
3) `POST /auth/reset-password` avec token + nouveau mot de passe.


## 6.3 rate_limit

Utilite:
- limiter les tentatives abusives sur endpoints sensibles.

Valeur:
- anti brute-force login,
- anti spam register/forgot,
- stabilite et disponibilite API.

---

## 7) Fonctionnalites futures a concevoir (avant implementation)

## 7.1 Q&A (priorite 1)

Regles fonctionnelles cible:
- student + teacher peuvent poser des questions,
- student + teacher peuvent repondre,
- teacher (et admin) peuvent publier une reponse officielle,
- reponse correcte validable par teacher du module (ou admin),
- anonymat optionnel pour les questions.

Regles pedagogiques obligatoires pour reponse officielle enseignant:
- champ `explanation` obligatoire,
- champ `example` obligatoire.

Exemple metier:
- Question: "C'est quoi LEFT JOIN?"
- Reponse officielle enseignant:
  - Explication textuelle claire,
  - Exemple SQL executable,
  - Tag "Reponse officielle".


## 7.2 Signal "Je ne comprends pas" (priorite 2)

Objectif:
- capter les blocages reels sur une ressource/module.

Regles:
- signal par utilisateur,
- anti-spam (fenetre de temps),
- aggregation pour dashboard teacher/admin.

Exemple:
- 35 signaux sur le meme chapitre SQL en 48h -> alerte enseignant.


## 7.3 Sessions de rattrapage (priorite 3)

Types:
- open session (ouverte a tous selon regle plateforme),
- private session (groupe cible: module/program/semester/cohorte).

Capacites:
- creation par teacher/admin,
- gestion places, statut, participation,
- lien de session (visioconference ou salle virtuelle).

Exemple:
- session open: "Jointures SQL - Debutant" (100 places)
- session private: "Revision Examen S3 Module X" (groupe cible)

---

## 8) Architecture cible recommandee

Style:
- modular monolith (rapide, lisible, maintenable a ce stade).

Modules logiques:
1. Identity & Access
2. Academic Catalog
3. Resource Lifecycle
4. Engagement (ratings, favorites, downloads)
5. Q&A
6. Sessions
7. Admin Analytics
8. Audit & Compliance

Flux technique:
- route -> controller -> service -> SQL/procedure -> DB

Regle importante:
- conserver les policies RBAC centralisees (pas de duplication incoherente).

---

## 9) Plan par phases (sprints)

## Sprint 0 - Cadrage final (analyse/conception)

Livrables:
- matrice RBAC definitive,
- dictionnaire de donnees,
- contrats API des futures features.


## Sprint 1 - Consolidation base de donnees

Livrables:
- schema canonique aligne,
- migrations propres,
- index critiques,
- verification contraintes FK/unique/check.


## Sprint 2 - Q&A Core

Livrables:
- questions/reponses,
- statut officiel,
- validation reponse correcte,
- anonymat question.


## Sprint 3 - Signaux blocage

Livrables:
- endpoint signal,
- agregations et dashboard de blocage.


## Sprint 4 - Sessions de rattrapage

Livrables:
- creation open/private,
- inscription participants,
- controle visibilite.


## Sprint 5 - Hardening final

Livrables:
- audit enrichi,
- rate limit cible,
- relecture complete RBAC.


## Sprint 6 - Phase finale de test

Livrables:
- tests unitaires,
- tests integration API,
- tests E2E par role (public/student/teacher/admin),
- tests migration DB,
- rapport final de validation.

---

## 10) Exemples concrets de scenarios utilisateur

## Scenario A - Etudiant contributeur

1) Student cree une ressource -> `pending`.
2) Admin valide -> `published`.
3) Teacher et Students peuvent noter/favoriser.
4) Student createur voit ses stats de contribution.


## Scenario B - Enseignant pedagogue

1) Teacher repond a une question Q&A.
2) Il doit fournir explication + exemple.
3) Reponse marquee officielle.
4) Si besoin, creation session de rattrapage.


## Scenario C - Admin gouvernance

1) Admin filtre ressources en attente.
2) Verifie qualite + securite documentaire.
3) Publie/rejette avec raison.
4) Action tracee dans audit logs.

---

## 11) Definition of Done (DoD) globale

Une phase est consideree complete si:
- les regles metier sont appliquees,
- RBAC est respecte,
- les tests de la phase sont verts,
- la documentation API est a jour,
- les actions sensibles sont auditees,
- aucune regression critique n'est ouverte.

---

## 12) Points de vigilance

1) Eviter divergence entre schema BD reel et logique backend.
2) Eviter duplication de regles entre controller/service/SQL sans source unique.
3) Garder la distinction role vs ownership partout.
4) Respecter la regle metier: admin sans favorites/ratings.
5) Garder la phase test finale complete avant release.

---

## 13) Decision resume

Le projet passe en mode execution en suivant ce chemin:
- conception claire,
- implementation incremental par sprint,
- validation finale par tests complets.

Ce document est la reference pour demarrer les prochaines phases de developpement.

---

## 14) Etat d'avancement implementation (demarrage des phases)

### Phase 1 lancee (backend)

Ce qui est deja implemente dans le code:
- ajout du module Q&A backend:
  - `src/routes/qaRoutes.js`
  - `src/controllers/qaController.js`
  - `src/services/qaService.js`
- ajout migration BD Q&A:
  - `Database/migrations/003_add_qa_core.sql`
- durcissement regle metier ratings/favorites:
  - admin bloque sur endpoints ratings authentifies,
  - admin bloque sur endpoints favoris utilisateur,
  - endpoint admin d'audit favoris conserve (`/favorites/resource/:resourceId/users`).

### Actions BD necessaires avant test Q&A

La migration Q&A doit etre executee en base pour activer les endpoints `/api/qa/*`.

Exemple (PostgreSQL):

```sql
\i Database/migrations/003_add_qa_core.sql
```

ou via ton outil SQL habituel (DBeaver), en executant le script complet.

### Verification rapide apres migration

1. `GET /api/qa/questions` -> doit retourner `200` (liste vide ou data).
2. `POST /api/qa/questions` (student/teacher/admin connecte) -> `201`.
3. `POST /api/qa/questions/:id/answers` (student/teacher/admin) -> `201`.
4. `PATCH /api/qa/answers/:answerId/accept` (teacher/admin) -> `200`.
5. `POST /api/ratings` avec admin -> `403` (attendu).
6. `GET /api/favorites/my-favorites` avec admin -> `403` (attendu).
