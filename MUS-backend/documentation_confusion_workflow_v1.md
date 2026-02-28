# Documentation simple - Workflow "Je ne comprends pas" (V1)

## 1) Objectif

Cette phase ajoute un workflow complet apres un signal etudiant:

1. Student envoie un signal de blocage sur une ressource.
2. Le backend cree/alimente un **cas de blocage**.
3. Le cas est assigne automatiquement (teacher referent prioritaire, fallback admin).
4. Teacher/Admin traitent le cas et mettent a jour son statut.
5. Une reponse officielle Q&A peut etre liee au cas.
6. Resolution manuelle du cas.
7. Notifications in-app + temps reel (SSE).

Ce design est compatible avec `plan_implementation_sprints_qna.md` et reste coherent avec les regles RBAC.

---

## 2) Analyse de l'etat initial

### Ce qui existait deja

- Table `resource_confusion_signals` (signal brut, anti-spam).
- Endpoints:
  - `POST /resources/:id/confusion-signals` (student)
  - `GET /resources/:id/confusion-signals/count` (teacher/admin)
  - `GET /resources/:id/confusion-signals/recent` (teacher/admin)
  - `GET /admin/confusion/overview` (admin)
- Q&A existant (questions/reponses/commentaires/moderation/badges).

### Limite initiale

- Pas de vraie notion de **cas de traitement**.
- Pas d'assignation structurelle teacher/admin.
- Pas de statut metier progressif pour le student.
- Pas de notifications in-app temps reel.

---

## 3) Changements DB realises

## 3.1 Migration ajoutee

- `Database/migrations/010_add_confusion_cases_notifications_workflow.sql`

Elle ajoute:

- Enums:
  - `confusion_case_status`: `nouveau`, `assigne`, `en_cours`, `repondu_officiel`, `resolu`
  - `confusion_case_priority`: `basse`, `normale`, `haute`, `critique`
- Tables:
  - `module_staff_assignments`
  - `resource_confusion_cases`
  - `resource_confusion_case_events`
  - `user_notifications`
- Index/contraintes:
  - unicite case ouverte par `(student_id, resource_id, module_id)`
  - index staff/student/notifications
  - trigger `updated_at` sur `resource_confusion_cases`

## 3.2 Procedures SQL ajoutees

- Fichier: `Database/procedures/confusion_workflow.sql`

Fonctions principales:

- `sp_confusion_signal_create_and_assign`
- `sp_confusion_pick_assignee`
- `sp_confusion_cases_get_for_student`
- `sp_confusion_cases_get_for_staff`
- `sp_confusion_case_assign`
- `sp_confusion_case_update_status`
- `sp_confusion_case_link_official_answer`
- `sp_module_staff_assignment_upsert`
- `sp_module_staff_assignment_get_by_module`
- `sp_notification_create`
- `sp_notification_get_for_user`
- `sp_notification_mark_read`

## 3.3 Mise a jour schema reference

- `Database/database_DDL.sql` mis a jour avec les nouvelles enums/tables/index/trigger.

---

## 4) Changements backend realises

## 4.1 Snippets SQL

- `src/snippets/snippets.js`
  - ajout blocs `SQL.CONFUSION` et `SQL.NOTIFICATION`

## 4.2 Services

- `src/services/resourceConfusionService.js` (refonte)
  - creation signal + creation/maj case + assignation auto
  - badges confusion
  - listing cases student/staff
  - assignation admin
  - update statut case
  - liaison reponse officielle Q&A -> case
  - gestion referents module
- `src/services/notificationService.js`
  - creer notification
  - lister notifications user
  - marquer notification lue
- `src/services/notificationStreamService.js`
  - diffusion temps reel SSE par utilisateur

## 4.3 Controllers

- `src/controllers/resourceConfusionController.js` (etendu)
  - handlers existants + nouveaux handlers cases/referents
- `src/controllers/notificationController.js` (nouveau)
  - list notifications
  - mark read
  - stream SSE
- `src/controllers/qaController.js`
  - apres reponse officielle, liaison automatique vers confusion case

## 4.4 Routes

- `src/routes/confusionCaseRoutes.js` (nouveau)
  - `GET /students/me/confusion-cases`
  - `GET /confusion/cases`
  - `PATCH /confusion/cases/:caseId/assign`
  - `PATCH /confusion/cases/:caseId/status`
  - `POST /confusion/module-staff-assignments`
  - `GET /confusion/module-staff-assignments/:moduleId`
- `src/routes/notificationRoutes.js` (nouveau)
  - `GET /notifications`
  - `PATCH /notifications/:notificationId/read`
  - `GET /notifications/stream`
- `src/routes/index.js`
  - montage des nouvelles routes auth
- `src/routes/resourceRoutes.js`
  - `module_id` optionnel sur `POST /resources/:id/confusion-signals`
  - re-ajout explicite des routes count/recent confusion
- `src/routes/favoriteRoutes.js`
  - re-application de la regle metier: admin exclu des endpoints favoris utilisateur

## 4.5 Script de test workflow

- `scripts/confusion-workflow-e2e-check.mjs` (nouveau)
  - valide le workflow complet signal -> assignation -> traitement -> reponse officielle -> resolution -> notifications

---

## 5) Logique metier finale (V1)

## 5.1 Assignation automatique

Ordre applique:

1. `teacher_referent` primaire du module
2. autre `teacher_referent` actif du module
3. `admin_referent` primaire du module
4. autre `admin_referent` actif du module
5. fallback pool admin actif

## 5.2 Statuts case

- `nouveau`
- `assigne`
- `en_cours`
- `repondu_officiel`
- `resolu` (manuel uniquement)

## 5.3 Badges exposes au frontend

- `signal_recu`
- `pris_en_charge`
- `reponse_officielle`
- `resolu`

## 5.4 Roles

- Student:
  - cree signal
  - voit ses cases
  - voit ses notifications
- Teacher:
  - voit cases de ses modules referes (ou assignees)
  - met a jour statut
  - publie reponse officielle
- Admin:
  - supervision globale
  - assign/reassign
  - gere referents module
- Public:
  - aucun acces au workflow interne confusion

---

## 6) Testing execute et resultats

Commandes executees (serveur propre + limites temporaires de test):

- `scripts/confusion-e2e-check.mjs`
- `scripts/qa-e2e-check.mjs`
- `scripts/confusion-workflow-e2e-check.mjs`

Resultats finaux:

- Confusion E2E: **PASS 25/25**
- QA E2E: **PASS 48/48**
- Confusion Workflow E2E: **PASS 22/22**

Tous les cas critiques sont valides:

- anti-spam 2h student
- assignation auto referent/fallback
- liaison reponse officielle -> case
- resolution manuelle
- notifications in-app + retrieval
- contraintes RBAC (incluant admin bloque sur favoris utilisateur)

---

## 7) Fichiers modifies/ajoutes (cette phase)

DB:

- `Database/migrations/010_add_confusion_cases_notifications_workflow.sql`
- `Database/procedures/confusion_workflow.sql`
- `Database/database_DDL.sql`

Backend:

- `src/snippets/snippets.js`
- `src/services/resourceConfusionService.js`
- `src/services/notificationService.js`
- `src/services/notificationStreamService.js`
- `src/controllers/resourceConfusionController.js`
- `src/controllers/notificationController.js`
- `src/controllers/qaController.js`
- `src/routes/confusionCaseRoutes.js`
- `src/routes/notificationRoutes.js`
- `src/routes/resourceRoutes.js`
- `src/routes/index.js`
- `src/routes/favoriteRoutes.js`
- `scripts/confusion-workflow-e2e-check.mjs`

---

## 8) Resume court

La partie "Je ne comprends pas" est maintenant un workflow robuste et exploitable:

- signal etudiant -> case structuree -> assignation -> traitement -> reponse officielle -> resolution manuelle,
- notifications in-app + temps reel,
- badges frontend-ready,
- alignement securite/performance/RBAC,
- testee en multi-role avec suites E2E vertes.
