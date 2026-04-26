# Q&A P0 Build Progress

Ce suivi est volontairement accelere (pas force par jour), tout en respectant la structure du plan P0.

## Done

- [x] Q&A thread principal dans `ResourcePreviewPage` (questions/reponses/commentaires).
- [x] Creation question/reponse/commentaire avec validations UI alignees backend.
- [x] Support question anonyme (`is_anonymous`) cote UI.
- [x] Contraintes teacher pour reponse officielle (`explanation`, `example`).
- [x] Moderation/acceptation exposees dans le thread.
- [x] Deep-link notifications et preview (`question`, `answer`, `comment`).
- [x] Highlight + scroll cible dans le thread (answer/comment).
- [x] Confusion bridge (creation signal + liste de cas etudiant pour la ressource).
- [x] Fix parsing module mapping via `data.modules` (blocage faux "resource not linked").
- [x] Fallback module inference from loaded questions (`module_id`) pour eviter blocage d'ecriture si mapping endpoint est partiellement incomplet.
- [x] Pagination liste des questions + `Load more questions`.
- [x] Retry sur erreur Q&A + etat de chargement dedie pour thread.
- [x] Stabilisation selection question lors pagination (`append`) pour eviter incoherence sur thread actif.
- [x] Clarification UX: message explicite que les commentaires sont lies a une question ou une reponse.
- [x] Ajout selection de module contextuel dans le formulaire question quand une ressource est liee a plusieurs modules.
- [x] Reset securise du module selectionne au changement de ressource pour eviter ecriture sur mauvais module.
- [x] Fixs UX connexes: register redirect `/dashboard`, library CTA vers `/discover`.
- [x] Fix lint bloquant theme (`MuiDialog` duplique).
- [x] Build frontend OK.
- [x] Fix syntaxe script backend `confusion-workflow-e2e-check.mjs`.
- [x] Preservation and normalization of `metadata.academicContext` in frontend resource models.
- [x] Resource edit hydration now prefers saved academic context before reconstructing from module/program fallbacks.
- [x] Post-save verification of `resource_module_map` after create/update resource mapping.
- [x] Q&A governance backend: dedicated close/reopen question lifecycle endpoint for `teacher/admin`.
- [x] Q&A governance frontend: `Close` / `Reopen` actions wired in preview thread.
- [x] Q&A governance validation: backend syntax + frontend lint/build passed.
- [x] Notifications enrichies backend: auteur question notifie lors d'une nouvelle reponse.
- [x] Notifications enrichies backend: auteur reponse notifie lors d'un nouveau commentaire sur sa reponse.
- [x] Notifications enrichies backend: auteur notifie lors d'une moderation `hide/delete` sur question/reponse/commentaire.
- [x] Aucun changement frontend requis pour deep-link: payloads `resource_id/question_id/answer_id/comment_id` restent compatibles.
- [x] UI confusion staff ajoutee: page dashboard liste + detail des cas pour `teacher/admin`.
- [x] UI confusion staff: assignation admin, mise a jour de statut, timeline, et lien vers preview discussion.
- [x] Navigation et routing dashboard ajoutes pour les cas confusion.
- [x] Bloc C complete: module par defaut intelligent = module du profil etudiant si disponible, sinon dernier module utilise, sinon premier module lie.
- [x] Persistance locale du dernier module utilise pour Q&A/confusion.

## In Progress

- [ ] Validation smoke scripts et verification finale de non-regression.
  - smoke executes mais bloques par auth rate-limit/credentials dans cet environnement.

## Deferred (decision)

- [ ] Smoke `test:smoke:qa` et `test:smoke:confusion` reportes (demande explicite: continuer le build sans bloquer sur ces tests).

## Next

- [ ] Consolidation finale des preuves de validation (Q&A/Confusion/Notifications).
- [ ] Redaction doc finale `doc.md` (explication complete, decisions, limites, prochaines etapes).

## Corrective Sub-sprint 1

- [x] Notification confusion -> routage vers `/dashboard/confusion?case=<id>` au lieu de la preview Q&A.
- [x] Page confusion: ciblage du bon cas depuis query param notification.
- [x] Page confusion: suppression d'affichages trop techniques (UUID actor/assignee dans l'UI principale).
- [x] Page confusion: statuts plus lisibles et timeline plus humaine.
- [x] Page confusion: toasts sur assignation et mise a jour de statut.
- [x] Q&A preview: explication visible du statut `closed`.
- [x] Q&A preview: meilleure fiabilite visuelle des actions `hide/show/delete` et `close/reopen` via feedback utilisateur.
- [x] Q&A preview: auto-refresh periodique pour mieux refleter les changements de moderation.
- [x] Q&A preview: meilleure mise en avant de la reponse officielle (`explanation` + `example`).

## Corrective Sub-sprint 2

- [x] Page confusion staff: workflow plus guide avec prochaine action visible.
- [x] Page confusion staff: notes etudiant affichees quand disponibles.
- [x] Page confusion staff: badges et statuts humanises.
- [x] Page confusion staff: double acces a la discussion liee (repondre / lecture seule).
- [x] Q&A preview: labels de statuts plus clairs (`Open`, `Answered`, `Closed`).
- [x] Q&A preview: toast sur acceptation d'une reponse.
