# Plan d'implementation detaille - Q&A, moderation, quotas

## Decision metier validee

- Lecture Q&A: publique.
- Ecriture Q&A: authentification obligatoire.
- Student + Teacher peuvent poser/repondre/commenter.
- Badge `officiale`: teacher uniquement.
- Badge `peer`: student.
- Badge `acceptee`: reponse marquee meilleure reponse.
- `is_accepted` peut etre defini par teacher ou admin.
- Une seule reponse acceptee par question (contrainte DB).
- Si une nouvelle reponse est acceptee, l'ancienne reste visible mais perd le badge acceptee.
- Moderation reponses: teacher/admin (active, hidden, deleted) avec raison obligatoire hors `active`.
- Quotas student: max 5 questions / 2h, max 5 reponses / 2h.

## Migrations DB (hors backend)

Fichier a executer:
- `Database/migrations/003_add_qa_core.sql`

Ce script ajoute:
- `qa_questions`
- `qa_answers`
- `qa_comments`
- enums `qa_question_status`, `qa_moderation_status`
- index performance
- trigger `updated_at`
- contrainte unicite partielle:
  - `UNIQUE(question_id) WHERE is_accepted = true`

## Endpoints Q&A implementes

Base: `/api/qa`

### Lecture publique

- `GET /questions`
  - query: `module_id?`, `status?`, `include_hidden?`
- `GET /questions/:questionId`
  - query: `include_hidden?`
- `GET /questions/:questionId/answers`
- `GET /questions/:questionId/comments`
- `GET /answers/:answerId/comments`

### Ecriture authentifiee

- `POST /questions`
  - roles: `student`, `teacher`, `admin`
  - champs obligatoires: `module_id`, `resource_id`, `title`, `body`
- `POST /questions/:questionId/answers`
  - roles: `student`, `teacher`, `admin`
- `POST /questions/:questionId/comments`
  - roles: `student`, `teacher`, `admin`
- `POST /answers/:answerId/comments`
  - roles: `student`, `teacher`, `admin`

### Gouvernance (teacher/admin)

- `PATCH /answers/:answerId/accept`
  - roles: `teacher`, `admin`
- `PATCH /answers/:answerId/moderate`
  - roles: `teacher`, `admin`
  - body:
    - `moderation_status`: `active | hidden | deleted`
    - `reason`: requis si `hidden` ou `deleted`

## Reponses backend utiles frontend

`GET /questions/:questionId/answers` renvoie pour chaque reponse:

- `is_official`
- `is_accepted`
- `badges` (`officiale`, `peer`, `acceptee`)

Tri par defaut:
1. `is_accepted DESC`
2. `is_official DESC`
3. `created_at ASC`

## Regles de securite/performance implementees

- RBAC strict par route.
- Validation d'entree via `express-validator`.
- Quotas anti-spam student.
- Moderation avec raison (auditabilite).
- Index dedies sur colonnes chaudes (`question_id`, `module_id`, `user_id`, `created_at`, `moderation_status`).
- Contrainte DB contre double meilleure reponse.

## Ce qui a ete adapte en dehors Q&A

- Ratings ecriture limites a `student|teacher`.
- Favorites utilisateur limites a `student|teacher`.
- Endpoint admin d'audit favoris conserve:
  - `GET /favorites/resource/:resourceId/users`

## Etapes suivantes (sprint execution)

1. Executer migration `003_add_qa_core.sql`.
2. Tester endpoints Q&A (CRUD base + accept + moderation + quota).
3. Executer migration `004_enforce_qa_question_resource_required.sql`.
4. Executer migration `005_cleanup_and_enforce_qa_question_integrity.sql`.
5. Executer migration `006_add_resource_confusion_signals.sql`.
6. Tester endpoints confusion signals + overview admin.
7. Finaliser campagne tests E2E multi-role.
