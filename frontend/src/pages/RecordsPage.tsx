import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUserHistory, getUserStats } from '../services/userAPI';
import { getUserId } from '../utils/userAuth';
import type { Activity, UserStats } from '../types/user';
import { ActivityFilters } from '../components/records/ActivityFilters';
import { ActivityCard } from '../components/records/ActivityCard';

/**
 * Records Page - User activity history
 * Follows NarrowDownPage structure for visual consistency
 */
export function RecordsPage() {
  const navigate = useNavigate();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'generation' | 'narrow_down'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // 加载数据
  useEffect(() => {
    loadData();
  }, [activeFilter, offset]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userId = getUserId();
      console.log('📊 [RecordsPage] 加载历史，user_id:', userId);
      
      // 并发获取历史和统计
      const [historyRes, statsRes] = await Promise.all([
        getUserHistory({
          limit,
          offset,
          workflowType: activeFilter === 'all' ? undefined : activeFilter,
        }),
        getUserStats(),
      ]);
      
      setActivities(historyRes.activities);
      setTotal(historyRes.total);
      setStats(statsRes);
      
      console.log('✅ [RecordsPage] 数据加载成功:', {
        activities: historyRes.activities.length,
        total: historyRes.total,
      });
    } catch (err) {
      console.error('❌ [RecordsPage] 加载失败:', err);
      setError(err instanceof Error ? err.message : 'Failed to load records');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filter: 'all' | 'generation' | 'narrow_down') => {
    setActiveFilter(filter);
    setOffset(0); // 重置分页
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header - Same style as NarrowDownPage */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Home</span>
          </button>
          
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-pink-500 to-purple-600 
                         bg-clip-text text-transparent">
            Records
          </h1>
          
          <div className="w-24" />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Summary */}
        {stats && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Generate Stats */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎨</span>
                <h3 className="text-lg font-semibold text-gray-900">Generate Activities</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="text-xl font-bold text-pink-600">{stats.generation.count}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tokens</p>
                  <p className="text-xl font-bold text-purple-600">
                    {stats.generation.total_tokens.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Narrow Down Stats */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎯</span>
                <h3 className="text-lg font-semibold text-gray-900">Narrow Down Activities</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="text-xl font-bold text-purple-600">{stats.narrow_down.count}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tokens</p>
                  <p className="text-xl font-bold text-pink-600">
                    {stats.narrow_down.total_tokens.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <ActivityFilters
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />

        {/* Activity List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-2">⏳</div>
              <p className="text-gray-600">Loading records...</p>
            </div>
          </div>
        ) : error ? (
          <motion.div
            className="p-6 bg-red-50 border-2 border-red-200 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </motion.div>
        ) : activities.length === 0 ? (
          <motion.div
            className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl text-gray-700 mb-2">No activities yet</p>
              <p className="text-sm text-gray-500">
                Start using Generate or Narrow Down to see your history here
              </p>
              <div className="mt-6 flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/app/generate')}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 
                             text-white rounded-lg hover:shadow-md transition-all"
                >
                  Go to Generate
                </button>
                <button
                  onClick={() => navigate('/app/narrow-down')}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 
                             text-white rounded-lg hover:shadow-md transition-all"
                >
                  Go to Narrow Down
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
            
            {/* Pagination */}
            {total > limit && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg
                             text-gray-700 hover:border-gray-300 hover:shadow-sm
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all"
                >
                  ← Previous
                </button>
                
                <span className="flex items-center text-sm text-gray-600">
                  {offset + 1} - {Math.min(offset + limit, total)} of {total}
                </span>
                
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg
                             text-gray-700 hover:border-gray-300 hover:shadow-sm
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

