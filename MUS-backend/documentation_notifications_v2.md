# Documentation V2 - Notifications externes (email + push)

## 1) Objectif V2

Apres V1 (notifications in-app + SSE), V2 ajoute les canaux externes:

- email (SMTP),
- push (via gateway HTTP),
- suivi des tentatives de livraison (audit technique).
- retry automatique avec backoff exponentiel sur les echecs techniques.

Le systeme reste compatible avec la logique metier V1:

- student recoit un suivi clair du cas,
- teacher/admin traitent et notifient,
- frontend continue de fonctionner sans changement bloquant.

---

## 2) Ce qui a ete ajoute

## 2.1 Base de donnees

Nouveaux fichiers:

- `Database/migrations/011_add_notification_channels_v2.sql`
- `Database/procedures/notifications_v2.sql`

Tables ajoutees:

- `user_push_devices`
  - tokens devices par utilisateur (`web|android|ios`), activation/desactivation,
  - `last_seen_at`, `updated_at`, index par user.
- `notification_deliveries`
  - journal technique par notification/canal,
  - `channel` (`email|push`), `status` (`pending|sent|failed|skipped`),
  - destination, erreur, attempts, timestamps.

Mise a jour schema reference:

- `Database/database_DDL.sql` (tables/index/triggers V2 inclus).

## 2.2 Procedures SQL

Fonctions V2 principales:

- `sp_notification_get_user_preferences`
- `sp_notification_register_push_device`
- `sp_notification_unregister_push_device`
- `sp_notification_list_push_devices`
- `sp_notification_delivery_create`
- `sp_notification_delivery_update_status`
- `sp_notification_delivery_get_retry_candidates`
- `sp_notification_delivery_prepare_retry`

Ces fonctions sont aussi reprises dans la migration pour permettre un deploiement auto-suffisant.

## 2.3 Backend

Snippets SQL:

- `src/snippets/snippets.js` enrichi (`NOTIFICATION` V2).

Services:

- `src/services/notificationDeliveryService.js`
  - lecture preferences user,
  - dispatch email SMTP,
  - dispatch push via `PUSH_GATEWAY_URL`,
  - creation/maj `notification_deliveries`,
  - cycle de retry (batch) avec backoff exponentiel.
- `src/services/notificationRetryWorkerService.js`
  - worker periodique non bloquant,
  - evite les executions concurrentes d'un meme cycle,
  - logs de synthese des retries traites.
- `src/services/notificationService.js`
  - integration dispatch externe en best effort,
  - gestion devices push (register/list/unregister).

Controllers/routes:

- `src/controllers/notificationController.js`
- `src/routes/notificationRoutes.js`

Nouveaux endpoints:

- `POST /api/notifications/push-devices`
- `GET /api/notifications/push-devices`
- `DELETE /api/notifications/push-devices/:deviceToken`

Les endpoints V1 restent actifs:

- `GET /api/notifications`
- `PATCH /api/notifications/:notificationId/read`
- `GET /api/notifications/stream` (SSE)

---

## 3) Logique de livraison V2

Quand une notification in-app est creee:

1. publication SSE immediate (V1),
2. tentative email,
3. tentative push,
4. trace des resultats dans `notification_deliveries`.

En cas de `failed`:

5. worker de retry relance les deliveries eligibles,
6. delai avant retry = `base_delay_seconds * 2^(attempts-1)`,
7. chaque retry incremente `attempts` (jusqu'au max configure).

Cas possibles par canal:

- `sent`: succes,
- `failed`: erreur technique (SMTP/gateway),
- `skipped`: canal desactive ou non configure.

Exemples de skip normaux:

- SMTP absent -> email skipped,
- aucun device push actif -> push skipped,
- preferences utilisateur desactivees.

---

## 4) Variables d'environnement V2

Email:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE` (`true|false`)
- `SMTP_USER` (optionnel)
- `SMTP_PASS` (optionnel)
- `SMTP_FROM`

Push:

- `PUSH_GATEWAY_URL`
- `PUSH_GATEWAY_TOKEN` (optionnel)

Sans ces variables, le backend continue de fonctionner (livraison marquee `skipped`).

Retry worker:

- `NOTIFICATION_RETRY_ENABLED` (`true|false`, defaut `true`)
- `NOTIFICATION_RETRY_RUN_ON_START` (`true|false`, defaut `true`)
- `NOTIFICATION_RETRY_INTERVAL_MS` (defaut `30000`)
- `NOTIFICATION_RETRY_BATCH_SIZE` (defaut `25`)
- `NOTIFICATION_RETRY_MAX_ATTEMPTS` (defaut `5`)
- `NOTIFICATION_RETRY_BASE_DELAY_SECONDS` (defaut `60`)

---

## 5) Securite et performance

- RBAC conserve (routes notifications sous auth).
- Device token lie a l'utilisateur authentifie uniquement.
- Index dedies pour lectures frequentes (`user_push_devices`, `notification_deliveries`).
- Dispatch externe en best effort pour ne pas bloquer les reponses API.
- Retry en batch borne pour limiter la charge (`BATCH_SIZE`, `MAX_ATTEMPTS`).
- Backoff exponentiel pour reduire la pression sur provider indisponible.

---

## 6) Tests executes et resultats

Suites executees apres V2:

- `scripts/confusion-e2e-check.mjs` -> **PASS 25/25**
- `scripts/qa-e2e-check.mjs` -> **PASS 48/48**
- `scripts/confusion-workflow-e2e-check.mjs` -> **PASS 22/22**
- `scripts/notification-v2-smoke-check.mjs` -> **PASS 7/7**
- `scripts/notification-retry-smoke-check.mjs` -> **PASS 9/9**

Conclusion:

- pas de regression sur V1,
- V2 push devices fonctionne,
- architecture prete pour brancher un vrai provider push/email en production.
- retries automatiques disponibles sans impact sur les endpoints frontend.

---

## 7) Fichiers principaux modifies/ajoutes (V2)

DB:

- `Database/migrations/011_add_notification_channels_v2.sql`
- `Database/procedures/notifications_v2.sql`
- `Database/database_DDL.sql`

Backend:

- `src/services/notificationDeliveryService.js`
- `src/services/notificationService.js`
- `src/services/notificationRetryWorkerService.js`
- `src/controllers/notificationController.js`
- `src/routes/notificationRoutes.js`
- `src/snippets/snippets.js`
- `scripts/notification-v2-smoke-check.mjs`
- `scripts/notification-retry-smoke-check.mjs`
