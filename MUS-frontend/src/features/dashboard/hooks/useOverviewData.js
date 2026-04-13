import { useEffect, useMemo, useState } from 'react';
import adminService from '@/services/adminService';
import resourcesService from '@/services/resourcesService';
import personalizationService from '@/services/personalizationService';
import favoritesService from '@/services/favoritesService';

const EMPTY_RESOURCE_STATS = {
  totalResources: 0,
  publishedResources: 0,
  draftResources: 0,
  pendingResources: 0,
  rejectedResources: 0,
  archivedResources: 0,
  resourcesLast7Days: 0,
  resourcesLast30Days: 0,
  favoritesReceived: 0,
  favoritesLast7Days: 0,
  favoritesLast30Days: 0,
  downloadsReceived: 0,
  downloadsLast7Days: 0,
  downloadsLast30Days: 0,
  avgRating: 0,
  totalRatings: 0,
};

export const useOverviewData = ({ isAdmin }) => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myResourceStats, setMyResourceStats] = useState(EMPTY_RESOURCE_STATS);
  const [rejections, setRejections] = useState([]);
  const [rejectionsLoading, setRejectionsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [likedResourcesCount, setLikedResourcesCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    if (!isAdmin) {
      setStatsData(null);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const response = await adminService.getDashboard();
        if (mounted) setStatsData(response);
      } catch {
        if (mounted) setStatsData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    let mounted = true;
    if (isAdmin) {
      setRejections([]);
      setRejectionsLoading(false);
      return () => {
        mounted = false;
      };
    }

    const loadMyRejections = async () => {
      setRejectionsLoading(true);
      try {
        const data = await resourcesService.getMyRejections(5);
        if (mounted) setRejections(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setRejections([]);
      } finally {
        if (mounted) setRejectionsLoading(false);
      }
    };

    loadMyRejections();
    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    let mounted = true;
    if (isAdmin) {
      setLikedResourcesCount(0);
      return () => {
        mounted = false;
      };
    }

    const loadLikedResources = async () => {
      try {
        const rows = await favoritesService.getAllFavorites();
        if (!mounted) return;
        setLikedResourcesCount(Array.isArray(rows) ? rows.length : 0);
      } catch {
        if (mounted) setLikedResourcesCount(0);
      }
    };

    loadLikedResources();
    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    let mounted = true;
    if (isAdmin) {
      setRecommendations([]);
      setRecommendationsLoading(false);
      return () => {
        mounted = false;
      };
    }

    const loadRecommendations = async () => {
      setRecommendationsLoading(true);
      try {
        const rows = await personalizationService.getMyRecommendations(6);
        if (mounted) setRecommendations(Array.isArray(rows) ? rows : []);
      } catch {
        if (mounted) setRecommendations([]);
      } finally {
        if (mounted) setRecommendationsLoading(false);
      }
    };

    loadRecommendations();
    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    let mounted = true;
    if (isAdmin) {
      return () => {
        mounted = false;
      };
    }

    const loadMyStats = async () => {
      try {
        const data = await resourcesService.getMyResourceAnalytics();
        const toNumber = (value) => {
          const parsed = Number(value);
          return Number.isFinite(parsed) ? parsed : 0;
        };

        if (mounted) {
          setMyResourceStats({
            totalResources: toNumber(data?.total_resources),
            publishedResources: toNumber(data?.published_resources),
            draftResources: toNumber(data?.draft_resources),
            pendingResources: toNumber(data?.pending_resources),
            rejectedResources: toNumber(data?.rejected_resources),
            archivedResources: toNumber(data?.archived_resources),
            resourcesLast7Days: toNumber(data?.resources_last_7_days),
            resourcesLast30Days: toNumber(data?.resources_last_30_days),
            favoritesReceived: toNumber(data?.total_favorites_received),
            favoritesLast7Days: toNumber(data?.favorites_last_7_days),
            favoritesLast30Days: toNumber(data?.favorites_last_30_days),
            downloadsReceived: toNumber(data?.total_downloads_received),
            downloadsLast7Days: toNumber(data?.downloads_last_7_days),
            downloadsLast30Days: toNumber(data?.downloads_last_30_days),
            avgRating: toNumber(data?.avg_rating_received),
            totalRatings: toNumber(data?.total_ratings_received),
          });
        }
      } catch {
        if (mounted) setMyResourceStats(EMPTY_RESOURCE_STATS);
      }
    };

    loadMyStats();
    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  const stats = useMemo(() => {
    const students = statsData?.data?.students || {};
    const teachers = statsData?.data?.teachers || {};
    const globalStats = statsData?.data?.global || {};
    const rewardsStats = statsData?.data?.rewards || {};

    return {
      totalStudents: parseInt(students.total_students) || 0,
      activeStudents: parseInt(students.active_students) || 0,
      inactiveStudents: parseInt(students.inactive_students) || 0,
      totalTeachers: parseInt(teachers.total_teachers) || 0,
      activeTeachers: parseInt(teachers.active_teachers) || 0,
      inactiveTeachers: parseInt(teachers.inactive_teachers) || 0,
      teacherResources: parseInt(teachers.total_resources_by_teachers) || 0,
      teacherPublishedResources: parseInt(teachers.published_resources) || 0,
      teacherDraftResources: parseInt(teachers.draft_resources) || 0,
      teacherArchivedResources: parseInt(teachers.archived_resources) || 0,
      teacherResourcesLast7Days: parseInt(teachers.resources_last_7_days) || 0,
      totalResources: parseInt(students.total_resources_by_students) || 0,
      publishedResources: parseInt(students.published_resources) || 0,
      draftResources: parseInt(students.draft_resources) || 0,
      archivedResources: parseInt(students.archived_resources) || 0,
      totalFavorites: parseInt(students.total_favorites_by_students) || 0,
      totalRatings: parseInt(students.total_ratings_by_students) || 0,
      avgRating: parseFloat(students.avg_rating_given_by_students) || 0,
      resourcesLast7Days: parseInt(students.resources_last_7_days) || 0,
      resourcesLast30Days: parseInt(students.resources_last_30_days) || 0,
      newStudentsLast7Days: parseInt(students.new_students_last_7_days) || 0,
      newStudentsLast30Days: parseInt(students.new_students_last_30_days) || 0,
      topContributor: {
        id: students.most_active_student_id,
        name: students.most_active_student_name,
        resources: parseInt(students.most_active_student_resources) || 0,
      },
      global: {
        totalUsers: parseInt(globalStats.total_users) || 0,
        totalResources: parseInt(globalStats.total_resources) || 0,
        totalFavorites: parseInt(globalStats.total_favorites) || 0,
        totalRatings: parseInt(globalStats.total_ratings) || 0,
      },
      rewards: {
        totalDownloads: parseInt(rewardsStats.total_downloads) || 0,
        downloadsLast7Days: parseInt(rewardsStats.downloads_last_7_days) || 0,
        downloadsLast30Days: parseInt(rewardsStats.downloads_last_30_days) || 0,
        totalPointsAwarded: parseInt(rewardsStats.total_points_awarded) || 0,
        topPointsStudentName: rewardsStats.top_points_student_name || 'No data',
        topPointsValue: parseInt(rewardsStats.top_points_value) || 0,
      },
    };
  }, [statsData]);

  return {
    loading,
    stats,
    myResourceStats,
    rejections,
    rejectionsLoading,
    recommendations,
    recommendationsLoading,
    likedResourcesCount,
  };
};
