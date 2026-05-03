// src/features/discover/hooks/useNotifications.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '@/services/notificationService';

/**
 * Derives the navigation target URL from a notification object.
 * Pure function at module scope — never recreated, no closures.
 */
export const deriveNotificationTarget = (notification) => {
    const type = String(notification?.type || '').trim().toUpperCase();
    const payload = notification?.payload || {};
    const caseId = Number(payload.case_id || 0);
    const resourceId = Number(payload.resource_id || 0);
    const questionId = Number(payload.question_id || 0);
    const answerId = Number(payload.answer_id || 0);
    const commentId = Number(payload.comment_id || 0);

    if (type.startsWith('CONFUSION_') && caseId > 0) {
        return `/dashboard/confusion?case=${caseId}`;
    }
    if (resourceId > 0) {
        const params = new URLSearchParams();
        if (questionId > 0) params.set('question', String(questionId));
        if (answerId > 0) params.set('answer', String(answerId));
        if (commentId > 0) params.set('comment', String(commentId));
        const suffix = params.toString();
        return suffix
            ? `/discover/resources/${resourceId}/preview?${suffix}`
            : `/discover/resources/${resourceId}/preview`;
    }
    return '/dashboard';
};

/**
 * Encapsulates all notification state, SSE streaming, and handlers.
 * Use this hook in any navbar/header component that shows notifications.
 *
 * @param {boolean} isAuthenticated - Whether the current user is signed in.
 * @returns {{ notifications, loading, unreadCount, load, clear, handleClick }}
 */
export const useNotifications = (isAuthenticated) => {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    /** Count of unread notifications — recomputed only when list changes */
    const unreadCount = useMemo(
        () => notifications.reduce((total, item) => total + (item?.is_read ? 0 : 1), 0),
        [notifications],
    );

    /** Fetch the latest notification list from the API */
    const load = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const data = await notificationService.list({ page: 1, limit: 15 });
            setNotifications(Array.isArray(data.rows) ? data.rows : []);
        } catch {
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    /**
     * Click a notification:
     * 1. Optimistically mark as read in local state
     * 2. Persist the read-state to the API (rollback on failure)
     * 3. Navigate to the notification target
     */
    const handleClick = useCallback(async (notification) => {
        if (!notification) return;

        if (!notification.is_read) {
            // Optimistic update
            setNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)),
            );
            try {
                await notificationService.markRead(notification.id);
            } catch {
                // Rollback on failure
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notification.id ? { ...n, is_read: false } : n)),
                );
            }
        }

        navigate(deriveNotificationTarget(notification));
    }, [navigate]);

    const clear = useCallback(() => {
        setNotifications([]);
    }, []);

    const clearPersisted = useCallback(async () => {
        try {
            await notificationService.clearAll();
        } finally {
            clear();
        }
    }, [clear]);

    /** Initial load + SSE stream */
    useEffect(() => {
        if (!isAuthenticated) {
            setNotifications([]);
            return;
        }

        load();

        const stopStream = notificationService.openStream({
            onNotification: (incoming) => {
                setNotifications((prev) => {
                    // Prepend, deduplicate by id, cap at 40
                    const merged = [incoming, ...prev].filter(
                        (item, idx, arr) => arr.findIndex((row) => row.id === item.id) === idx,
                    );
                    return merged.slice(0, 40);
                });
            },
        });

        return () => { stopStream(); };
    }, [isAuthenticated, load]);

    return { notifications, loading, unreadCount, load, clear, clearPersisted, handleClick };
};
