# Documentation des changements backend

## 1) Resume des ameliorations appliquees

Cette version backend integre les corrections de securite, de logique metier et de structuration API suivantes:

- Separation claire des routes publiques, authentifiees et admin.
- RBAC (Role Based Access Control) renforce avec des protections explicites.
- Visibilite des ressources selon statut + proprietaire + role.
- Flux mot de passe securise avec reset par token (et non reset direct par email).
- CORS structure via whitelist `.env` + same-origin Swagger.
- Rate limit sur endpoints sensibles (auth/register/forgot password).
- Endpoint favorites sensible (`/favorites/resource/:resourceId/users`) reserve admin avec audit.
- Cohabitation UUID/int corrigee: `user` reste UUID, entities metier restent integer.


## 2) Regles globales de reponse API

Format standard:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Erreurs standard:

```json
{
  "success": false,
  "message": "..."
}
```

Codes usuels:

- `200` lecture/mise a jour/suppression OK.
- `201` creation OK.
- `400` validation invalide.
- `401` non authentifie.
- `403` non autorise (role insuffisant ou action interdite).
- `404` introuvable ou non visible.
- `409` conflit metier (doublon/association existante).


## 3) Capacites par role

### Public (sans token)

Peut:

- Lire les catalogues academiques publics (domains/programs/institutions/levels/semesters/modules).
- Lire les ressources publiques (`published` uniquement).
- Lire ratings publics (stats, top, recent, par resource).
- Utiliser `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/reset-password`.

Ne peut pas:

- Acceder aux routes `/admin/*`, `/roles/*`, `/user-roles/*`, `/favorites/*`, `/student-profiles/*`.
- Voir les ressources non publiees des autres utilisateurs.


### Student

Peut:

- Toutes les lectures publiques.
- Gerer son compte (`/auth/me`, `/auth/profile`, `/auth/password`, etc.).
- Creer ses ressources (statut controle par logique metier, typiquement `pending`).
- Voir ses ressources via `/resources/my-resources`.
- Changer certains statuts autorises par workflow (`pending -> draft`, `draft -> pending`, etc.).
- Gerer ses favoris (add/toggle/remove/list/stats).
- Ajouter/modifier/supprimer ses ratings.
- Gerer son profil etudiant (self only), et consulter ses roles (`/user-roles/:userId` si self).

Ne peut pas:

- Publier/archiver une ressource via endpoints admin (`/resources/:id/publish|archive`).
- Lire les favoris des autres utilisateurs.
- Acceder aux routes admin.
- Voir les ressources non publiees des autres utilisateurs.


### Teacher

Peut:

- Capacites student + creation de ressources enseignant.
- Consulter/editer ses ressources selon workflow et ownership.

Ne peut pas:

- Acceder aux endpoints admin.
- Publier/archiver via endpoints admin (sauf si role admin aussi).

Note metier observee:

- La creation teacher est geree par regle metier et peut etre forcee en `pending` selon la configuration.


### Admin

Peut:

- Tout ce que peuvent faire les autres roles.
- Gerer utilisateurs/roles/user-roles.
- Acceder a tout `/admin/*` (dashboard, statistiques, filtres, ressources globales).
- Gerer tous les catalogues academiques (create/update/delete).
- Publier/archiver des ressources.
- Voir les utilisateurs ayant favori une ressource (`GET /favorites/resource/:resourceId/users`).
- Voir les ressources non publiees (`draft/pending/rejected/archived`).

Ne peut pas:

- Bypasser validation schema/contraintes DB (erreurs 400/409 restent possibles).


## 4) Logique metier centrale: ressources

### Visibilite

- Public/non-admin: uniquement `published`.
- Owner: voit ses propres ressources meme non publiees.
- Admin: voit tout.

### Edition

- Owner/admin seulement.
- Owner ne peut modifier que certains statuts (ex: `draft` / `rejected` selon regles).

### Changement de statut

- Workflow strict applique en service.
- `publish` et `archive` via endpoints admin dedies.

### Favorites

- Un favori n'est autorise que si la ressource est visible pour l'acteur.
- Liste des users qui ont favori une ressource: admin uniquement + audit.


## 5) Catalogue des APIs (routes, role, fonctionnalite)

Base URL: `/api`

### A) Auth (`/auth`)

- `POST /auth/register` (Public): creer compte utilisateur.
- `POST /auth/login` (Public): authentifier utilisateur.
- `POST /auth/email/check` (Public): verifier existence email.
- `POST /auth/password/forgot` (Public): alias forgot password (token).
- `POST /auth/forgot-password` (Public): demander token de reset.
- `POST /auth/reset-password` (Public): reset via token.
- `GET /auth/me` (Auth): infos user courant + roles.
- `POST /auth/logout` (Auth): logout session/cookie.
- `PATCH /auth/email` (Auth): changer email courant.
- `PATCH /auth/password` (Auth): changer mot de passe courant.
- `POST /auth/password/reset` (Auth): reset mdp user connecte.
- `PATCH /auth/profile` (Auth): maj profil user.
- `PATCH /auth/active` (Auth): toggle actif (selon autorisation backend).
- `DELETE /auth/me` (Auth): supprimer son compte.
- `GET /auth/user/:id` (Admin): lire user par UUID.
- `PATCH /auth/user/:id` (Admin): modifier user par UUID.
- `DELETE /auth/user/:id` (Admin): supprimer user par UUID.

Reponses typiques:

- Login/register: `200/201`, `data.user`, `data.token`.
- Forgot: `200` message neutre anti-enumeration.


### B) Resources (`/resources`)

- `POST /resources` (Auth): creer une ressource.
- `GET /resources` (Public): lister les ressources visibles.
- `GET /resources/my-resources` (Auth): mes ressources.
- `GET /resources/published` (Public): ressources publiees.
- `GET /resources/with-ratings` (Public): ressources + notes.
- `GET /resources/statuses` (Public): enum statuts.
- `GET /resources/educational-types` (Public): enum types pedagogiques.
- `GET /resources/formats` (Public): enum formats.
- `POST /resources/advanced-search` (Public): recherche avancee.
- `POST /resources/search-metadata` (Public): recherche metadata.
- `GET /resources/search/:searchTerm` (Public): recherche texte.
- `GET /resources/status/:status` (Public/Auth selon visibilite): filtrer par statut visible.
- `GET /resources/status/:status/count` (Public/Auth): count par statut (restreint hors admin).
- `GET /resources/educational-type/:educationalType` (Public): filtrer type.
- `GET /resources/educational-type/:educationalType/count` (Public/Auth): count type.
- `GET /resources/format/:format` (Public): filtrer format.
- `GET /resources/format/:format/count` (Public/Auth): count format.
- `GET /resources/resource-type/:resourceTypeId` (Public): filtrer type de ressource.
- `GET /resources/creator/:creatorId` (Public/Auth): ressources visibles d'un createur UUID.
- `GET /resources/creator/:creatorId/count` (Public/Auth): count createur.
- `GET /resources/language/:language` (Public): filtrer langue.
- `GET /resources/:id` (Public/Auth): lire 1 ressource si visible.
- `PATCH /resources/:id` (Owner/Admin): modifier ressource.
- `DELETE /resources/:id` (Owner/Admin): supprimer ressource.
- `PATCH /resources/:id/metadata` (Owner/Admin): modifier metadata.
- `PATCH /resources/:id/status` (Auth): transition de statut selon regles metier.
- `POST /resources/:id/publish` (Admin): publier ressource.
- `POST /resources/:id/archive` (Admin): archiver ressource.
- `GET /resources/:id/statistics` (Owner/Admin): stats d'une ressource.


### C) Resource-Module Map

- `GET /students/me/available-modules` (Auth): modules disponibles pour etudiant courant.
- `GET /resources/:resourceId/modules` (Public/Auth): modules d'une ressource visible.
- `POST /resources/:resourceId/modules` (Owner/Admin): associer module a ressource.
- `PATCH /resources/:resourceId/modules/:moduleId` (Owner/Admin): maj association.
- `DELETE /resources/:resourceId/modules/:moduleId` (Owner/Admin): retirer association.
- `DELETE /resources/:resourceId/modules` (Owner/Admin): retirer toutes associations.
- `GET /modules/:moduleId/resources` (Public/Auth): ressources visibles du module.


### D) Favorites (`/favorites`) [auth requis]

- `POST /favorites/toggle`: toggle favori.
- `POST /favorites`: ajouter favori.
- `GET /favorites/my-favorites`: lister mes favoris.
- `GET /favorites/my-favorites/recent`: favoris recents.
- `GET /favorites/my-favorites/count`: count favoris user.
- `DELETE /favorites/my-favorites/all`: supprimer tous mes favoris.
- `GET /favorites/my-statistics`: stats favoris user.
- `GET /favorites/search?q=...`: recherche favoris user.
- `GET /favorites/most-popular`: ressources les plus favorites.
- `GET /favorites/by-status/:status`: favoris filtres par statut.
- `GET /favorites/by-educational-type/:educationalType`: filtres type.
- `GET /favorites/by-format/:format`: filtres format.
- `GET /favorites/check/:resourceId`: verifier favori.
- `GET /favorites/resource/:resourceId/count`: count des favoris d'une ressource visible.
- `GET /favorites/resource/:resourceId/users` (Admin): users ayant favori ressource (+ audit).
- `DELETE /favorites/:resourceId`: retirer favori.


### E) Ratings (`/ratings`)

Public:

- `GET /ratings/top-rated`
- `GET /ratings/recent`
- `GET /ratings/resources-with-ratings`
- `GET /ratings/resource/:resourceId`
- `GET /ratings/resource/:resourceId/with-comments`
- `GET /ratings/resource/:resourceId/score/:score`
- `GET /ratings/resource/:resourceId/average`
- `GET /ratings/resource/:resourceId/statistics`
- `GET /ratings/resource/:resourceId/count`
- `GET /ratings/resource/:resourceId/date-range`
- `GET /ratings/user/:userId`
- `GET /ratings/user/:userId/count`
- `GET /ratings/user/:userId/summary`

Authentifie:

- `POST /ratings`: ajouter/modifier ma note.
- `GET /ratings/my-ratings`
- `GET /ratings/my-summary`
- `GET /ratings/resource/:resourceId/my-rating`
- `DELETE /ratings/resource/:resourceId`
- `GET /ratings/can-rate/:resourceId`


### F) Catalogues academiques

#### Domaines (`/domains`)

- Public: `GET /`, `GET /with-program-count`, `GET /search/:searchTerm`, `GET /name/:name`, `GET /:id`, `GET /:id/with-programs`, `GET /:id/programs`, `GET /:id/programs/count`.
- Admin: `POST /`, `PATCH /:id`, `DELETE /:id`.

#### Programs (`/programs`)

- Public: `GET /`, `GET /:id`, `GET /:id/institutions`.
- Admin: `POST /`, `PATCH /:id`, `DELETE /:id`.

#### Institutions (`/institutions`)

- Public: `GET /`, `GET /:id`, `GET /:id/programs`.
- Admin: `POST /`, `PATCH /:id`, `DELETE /:id`.

#### Institution Types (`/institution-types`)

- Public: `GET /`, `GET /:id`.
- Admin: `POST /`, `PATCH /:id`, `DELETE /:id`.

#### Institution-Programs (`/institution-programs`)

- Public: `GET /institutions/:id/programs`, `GET /programs/:id/institutions`.
- Admin: `POST /add`, `POST /remove`.

#### Levels (`/levels`)

- Public: `GET /`, `GET /with-semester-count`, `GET /search/:searchTerm`, `GET /program/:programId`, `GET /program/:programId/next-sort-order`, `GET /program/:programId/name/:name`, `GET /:id`, `GET /:id/semesters`, `GET /:id/semesters/count`, `GET /:id/full-details`.
- Admin: `POST /`, `PATCH /:id`, `DELETE /:id`, `POST /reorder`, `PATCH /:id/sort-order`.

#### Semesters (`/semesters`)

- Public: `GET /`, `GET /with-module-count`, `GET /search/:searchTerm`, `GET /level/:levelId`, `GET /level/:levelId/next-sort-order`, `GET /level/:levelId/name/:name`, `GET /:id`, `GET /:id/modules`, `GET /:id/modules/count`, `GET /:id/full-hierarchy`, `GET /:id/full-details`.
- Admin: `POST /`, `PATCH /:id`, `DELETE /:id`, `POST /reorder`, `PATCH /:id/sort-order`.

#### Modules (`/modules`)

- Public: `GET /`, `GET /with-resource-count`, `POST /check-exists`, `GET /search/:searchTerm`, `GET /semester/:semesterId`, `GET /level/:levelId`, `GET /program/:programId`, `GET /domain/:domainId`, `GET /resource-type/:resourceTypeId`, `GET /code/:code/semester/:semesterId`, `GET /semester/:semesterId/count`, `GET /:id`, `GET /:id/resources`, `GET /:id/resources/count`, `GET /:id/hierarchy`, `GET /:id/details`, `GET /:id/statistics`.
- Admin: `POST /`, `PATCH /:id`, `DELETE /:id`.


### G) Roles et profils

#### Roles (`/roles`) [auth global requis]

- Admin uniquement: `POST /`, `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`.

#### User Roles (`/user-roles`) [auth global requis]

- Admin: `POST /assign`, `POST /remove`, `PATCH /:userId`.
- Self ou Admin: `GET /:userId`.

#### Student Profiles (`/student-profiles`) [auth requis]

- Self ou Admin: create/read/update own profile endpoints.
- Admin: liste globale + filtres institution/program/semester + delete.


### H) Admin (`/admin`) [auth + role admin requis]

- Dashboard: `GET /admin/dashboard`
- Users: `GET /admin/users/overview`, `PATCH /admin/users/:userId/toggle-status`
- Students: `GET /admin/students`, `GET /admin/students/:userId`, `GET /admin/students/statistics`,
  `GET /admin/students/search`, `GET /admin/students/filter/status`,
  `GET /admin/students/filter/profile`, `GET /admin/students/filter/institution/:institutionId`,
  `GET /admin/students/filter/program/:programId`
- Resources: `GET /admin/resources`, `GET /admin/resources/statistics`,
  `GET /admin/resources/students`, `GET /admin/resources/teachers`,
  `GET /admin/students/:userId/resources` (legacy)


## 6) Differences importantes user UUID vs autres IDs integer

- IDs utilisateur (`userId`, `created_by`, etc.) = `UUID`.
- IDs metier (domain/program/institution/level/semester/module/resource/role/resource_type...) = `integer`.
- Swagger a ete corrige pour cet alignement sur les endpoints metier.


## 7) Securite infra/config a conserver

- `JWT_SECRET` obligatoire (fort).
- `JWT_EXPIRES_IN` configurable.
- `CLIENT_ORIGIN` whitelist frontend(s).
- CORS: same-origin Swagger autorise + whitelist stricte.
- Rate limits actifs sur auth/register/forgot/public.


## 8) Conseils d'exploitation

- Toujours tester avec `/api/docs` apres changement de `.env`.
- Redemarrer le serveur apres modification config.
- En prod: ne jamais laisser de secret par defaut.
- Pour audit securite, preferer les endpoints admin dedies plutot que des lectures directes DB.


## 9) Exemples request/response (endpoints critiques)

### 9.1 Auth login

Request:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@gmail.com",
  "password": "user1234!"
}
```

Response 200:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "052278ee-89d4-449f-9cbe-88f9ec33760c",
      "email": "user@gmail.com",
      "full_name": "...",
      "is_active": true
    },
    "token": "<jwt>"
  }
}
```


### 9.2 Forgot password (token flow)

Request:

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "student@example.com"
}
```

Response 200:

```json
{
  "success": true,
  "message": "If the email exists, a reset token has been generated",
  "data": {
    "requested": true,
    "expires_in_minutes": 60
  }
}
```

Reset request:

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "<reset-token>",
  "new_password": "Pass5678!"
}
```

Response 200:

```json
{
  "success": true,
  "message": "Password reset",
  "data": {
    "message": "Password reset"
  }
}
```


### 9.3 Creation resource (student/teacher)

Request:

```http
POST /api/resources
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Algebra Notes",
  "description": "Chapter 1",
  "status": "published",
  "resource_type_id": 1,
  "format": "pdf",
  "educational_type": "course"
}
```

Response 201:

```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    "id": 123,
    "title": "Algebra Notes",
    "status": "pending"
  }
}
```

Note: le status final est impose par la logique metier (ex: student/teacher -> `pending`).


### 9.4 Publication/archivage admin

Request:

```http
POST /api/resources/123/publish
Authorization: Bearer <admin-token>
```

Response 200:

```json
{
  "success": true,
  "message": "Resource published successfully",
  "data": {
    "id": 123,
    "status": "published"
  }
}
```


### 9.5 Favorites (user)

Toggle:

```http
POST /api/favorites/toggle
Authorization: Bearer <token>
Content-Type: application/json

{
  "resource_id": 123
}
```

Response 200:

```json
{
  "success": true,
  "message": "Resource added to favorites",
  "data": {
    "is_favorited": true,
    "action": "added"
  }
}
```

Count:

```http
GET /api/favorites/resource/123/count
Authorization: Bearer <token>
```

Response 200:

```json
{
  "success": true,
  "message": "Count retrieved successfully",
  "data": {
    "count": 5
  }
}
```


### 9.6 Favorites admin audit endpoint

Request:

```http
GET /api/favorites/resource/123/users?reason=security-audit
Authorization: Bearer <admin-token>
```

Response 200:

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "user_id": "...uuid...",
      "email": "...",
      "favorited_at": "..."
    }
  ]
}
```


### 9.7 Ratings user

Request:

```http
POST /api/ratings
Authorization: Bearer <token>
Content-Type: application/json

{
  "resource_id": 123,
  "score": 5,
  "comment": "Excellent"
}
```

Response 200:

```json
{
  "success": true,
  "message": "Rating saved successfully",
  "data": {
    "resource_id": 123,
    "score": 5,
    "comment": "Excellent"
  }
}
```


## 10) Tableau endpoint -> roles autorises -> codes attendus

### 10.1 Auth & user

| Endpoint | Public | Student | Teacher | Admin | Codes typiques |
|---|---:|---:|---:|---:|---|
| `POST /auth/register` | Oui | Oui | Oui | Oui | `201`, `400`, `429` |
| `POST /auth/login` | Oui | Oui | Oui | Oui | `200`, `400`, `401`, `429` |
| `GET /auth/me` | Non | Oui | Oui | Oui | `200`, `401` |
| `GET /auth/user/:id` | Non | Non | Non | Oui | `200`, `401`, `403`, `404` |


### 10.2 Resources

| Endpoint | Public | Student | Teacher | Admin | Codes typiques |
|---|---:|---:|---:|---:|---|
| `GET /resources` | Oui | Oui | Oui | Oui | `200` |
| `POST /resources` | Non | Oui | Oui | Oui | `201`, `400`, `401` |
| `GET /resources/my-resources` | Non | Oui | Oui | Oui | `200`, `401` |
| `GET /resources/:id` | Visible seulement | Oui (owner/visible) | Oui (owner/visible) | Oui | `200`, `404` |
| `PATCH /resources/:id` | Non | Proprietaire uniquement | Proprietaire uniquement | Oui | `200`, `401`, `403`, `404` |
| `POST /resources/:id/publish` | Non | Non | Non | Oui | `200`, `401`, `403`, `404` |


### 10.3 Resource-Module Map

| Endpoint | Public | Student | Teacher | Admin | Codes typiques |
|---|---:|---:|---:|---:|---|
| `GET /resources/:resourceId/modules` | Visible seulement | Oui | Oui | Oui | `200`, `404` |
| `GET /modules/:moduleId/resources` | Oui (published) | Oui | Oui | Oui (all) | `200`, `404` |
| `POST /resources/:resourceId/modules` | Non | Proprietaire uniquement | Proprietaire uniquement | Oui | `201`, `401`, `403`, `404`, `409` |


### 10.4 Favorites

| Endpoint | Public | Student | Teacher | Admin | Codes typiques |
|---|---:|---:|---:|---:|---|
| `GET /favorites/my-favorites` | Non | Oui | Oui | Oui | `200`, `401` |
| `POST /favorites/toggle` | Non | Oui | Oui | Oui | `200`, `401`, `404` |
| `GET /favorites/resource/:id/count` | Non | Oui | Oui | Oui | `200`, `401`, `404` |
| `GET /favorites/resource/:id/users` | Non | Non | Non | Oui | `200`, `401`, `403`, `404` |


### 10.5 Ratings

| Endpoint | Public | Student | Teacher | Admin | Codes typiques |
|---|---:|---:|---:|---:|---|
| `GET /ratings/resource/:resourceId` | Oui | Oui | Oui | Oui | `200`, `400` |
| `POST /ratings` | Non | Oui | Oui | Oui | `200`, `201`, `400`, `401`, `403` |
| `GET /ratings/my-ratings` | Non | Oui | Oui | Oui | `200`, `401` |


### 10.6 Catalogues + Admin

| Endpoint | Public | Student | Teacher | Admin | Codes typiques |
|---|---:|---:|---:|---:|---|
| `GET /domains` | Oui | Oui | Oui | Oui | `200` |
| `POST /domains` | Non | Non | Non | Oui | `201`, `401`, `403` |
| `PATCH /programs/:id` | Non | Non | Non | Oui | `200`, `401`, `403`, `404` |
| `GET /admin/dashboard` | Non | Non | Non | Oui | `200`, `401`, `403` |
| `GET /admin/resources` | Non | Non | Non | Oui | `200`, `401`, `403` |


## 11) Checklist rapide de verification apres deployment

- `GET /health` retourne `200`.
- Login admin fonctionne depuis Swagger (`/api/docs`).
- Public ne voit pas les resources `pending/draft/rejected/archived` des autres.
- Student/teacher voient leurs propres resources via `/resources/my-resources`.
- `GET /favorites/resource/:resourceId/users` renvoie `403` hors admin.
- `POST /auth/forgot-password` et `POST /auth/reset-password` fonctionnent.
- Endpoints catalogues CRUD non-admin renvoient `403`.
