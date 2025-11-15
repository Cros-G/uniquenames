import { motion } from 'framer-motion';

interface ActivityFiltersProps {
  activeFilter: 'all' | 'generation' | 'narrow_down';
  onFilterChange: (filter: 'all' | 'generation' | 'narrow_down') => void;
}

/**
 * 活动筛选组件
 * 遵循 design_system.md: 温暖明亮风格
 */
export function ActivityFilters({ activeFilter, onFilterChange }: ActivityFiltersProps) {
  const filters: Array<{ value: 'all' | 'generation' | 'narrow_down'; label: string; icon: string }> = [
    { value: 'all', label: 'All Activities', icon: '📊' },
    { value: 'generation', label: 'Generate', icon: '🎨' },
    { value: 'narrow_down', label: 'Narrow Down', icon: '🎯' },
  ];

  return (
    <div className="flex gap-3 mb-6">
      {filters.map((filter) => (
        <motion.button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all
            flex items-center gap-2
            ${activeFilter === filter.value
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>{filter.icon}</span>
          <span>{filter.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

