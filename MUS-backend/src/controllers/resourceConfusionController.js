import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  createConfusionSignal,
  getConfusionOverview,
  getResourceConfusionCount,
  getResourceConfusionRecent,
} from "../services/resourceConfusionService.js";
import { logAudit } from "../services/auditService.js";

/**
 * @swagger
 * tags:
 *   name: Resource Confusion
 *   description: Signaux "Je ne comprends pas" pour les ressources
 */

/**
 * @swagger
 * /resources/{id}/confusion-signals:
 *   post:
 *     summary: Envoyer un signal "Je ne comprends pas" (student)
 *     tags: [Resource Confusion]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 example: Je bloque sur la partie LEFT JOIN et les cas avec NULL
 *     responses:
 *       201:
 *         description: Signal enregistre
 *       429:
 *         description: Limite anti-spam atteinte
 */
export const createConfusionSignalHandler = asyncHandler(async (req, res) => {
  const resourceId = parseInt(req.params.id, 10);
  const { note = null } = req.body;

  const signal = await createConfusionSignal({
    resourceId,
    userId: req.user.id,
    note,
    actor: req.user,
  });

  await logAudit({
    userId: req.user.id,
    action: "CONFUSION_SIGNAL_CREATE",
    resourceType: "resource_confusion_signal",
    resourceId,
    newValue: { signal_id: signal.id },
    ip: req.ip,
    userAgent: req.get("user-agent") || null,
  });

  return successResponse(res, "Signal enregistre avec succes", signal, 201);
});

/**
 * @swagger
 * /resources/{id}/confusion-signals/count:
 *   get:
 *     summary: Obtenir le compteur des signaux d'une ressource (teacher/admin)
 *     tags: [Resource Confusion]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compteurs recuperes
 */
export const getResourceConfusionCountHandler = asyncHandler(async (req, res) => {
  const resourceId = parseInt(req.params.id, 10);
  const stats = await getResourceConfusionCount(resourceId);

  await logAudit({
    userId: req.user.id,
    action: "CONFUSION_RESOURCE_COUNT_READ",
    resourceType: "resource_confusion_signals",
    resourceId,
    ip: req.ip,
    userAgent: req.get("user-agent") || null,
  });

  return successResponse(res, "Compteurs de blocage recuperes avec succes", stats);
});

/**
 * @swagger
 * /resources/{id}/confusion-signals/recent:
 *   get:
 *     summary: Lister les derniers signaux d'une ressource (teacher/admin)
 *     tags: [Resource Confusion]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Liste des signaux recents
 */
export const getResourceConfusionRecentHandler = asyncHandler(async (req, res) => {
  const resourceId = parseInt(req.params.id, 10);
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
  const rows = await getResourceConfusionRecent(resourceId, limit);

  await logAudit({
    userId: req.user.id,
    action: "CONFUSION_RESOURCE_RECENT_READ",
    resourceType: "resource_confusion_signals",
    resourceId,
    newValue: { limit },
    ip: req.ip,
    userAgent: req.get("user-agent") || null,
  });

  return successResponse(res, "Signaux recents recuperes avec succes", rows);
});

/**
 * @swagger
 * /admin/confusion/overview:
 *   get:
 *     summary: Vue globale des signaux de blocage (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: group_by
 *         schema:
 *           type: string
 *           enum: [resource, module]
 *           default: resource
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Vue globale recuperée
 */
export const getConfusionOverviewHandler = asyncHandler(async (req, res) => {
  const groupBy = req.query.group_by || "resource";
  const days = req.query.days ? parseInt(req.query.days, 10) : 7;

  const overview = await getConfusionOverview({ groupBy, days });

  await logAudit({
    userId: req.user.id,
    action: "CONFUSION_OVERVIEW_READ",
    resourceType: "resource_confusion_signals",
    newValue: { group_by: groupBy, days },
    ip: req.ip,
    userAgent: req.get("user-agent") || null,
  });

  return successResponse(res, "Vue globale des blocages recuperée avec succes", {
    group_by: groupBy,
    days,
    rows: overview,
  });
});
