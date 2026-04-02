import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';

/**
 * Custom hook for fetching analytics data
 * Handles loading, error states, and data caching
 *
 * @param {number} timeRange - Time range in days (default: 30)
 * @returns {Object} Analytics data and state
 */
const useAnalyticsData = (timeRange = 30) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Calculate date range - remove 'Z' suffix for backend compatibility
      const now = new Date();
      const startDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000).toISOString().replace('Z', '');
      const endDate = now.toISOString().replace('Z', '');

      // Fetch all analytics data in parallel
      const [
        platformStats,
        courseStats,
        examStats,
        classStats,
        userTrend,
        examTrend,
        examIntelligence,
        comparative,
        userSegments,
        cohortAnalysis,
        churnRisk
      ] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getCourseStats(startDate, endDate),
        adminService.getExamStats(startDate, endDate),
        adminService.getClassStats(startDate, endDate),
        adminService.getUserTrend(timeRange),
        adminService.getExamTrend(timeRange),
        adminService.getExamIntelligence(startDate, endDate).catch(() => null),
        adminService.getComparativeAnalytics(startDate, endDate).catch(() => null),
        adminService.getUserSegments().catch(() => null),
        adminService.getCohortAnalysis().catch(() => null),
        adminService.getChurnRisk().catch(() => null)
      ]);

      setData({
        platformStats,
        courseStats,
        examStats,
        classStats,
        userTrend: userTrend || [],
        examTrend: examTrend || [],
        examIntelligence,
        comparative,
        userSegments,
        cohortAnalysis,
        churnRisk
      });
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return {
    data,
    loading,
    error,
    refresh: fetchAnalyticsData
  };
};

export default useAnalyticsData;
