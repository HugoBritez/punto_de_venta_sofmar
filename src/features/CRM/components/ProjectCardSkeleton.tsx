import React from 'react';
import { motion } from 'framer-motion';

const ProjectCardSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white border border-gray-200 rounded-xl shadow-md p-4"
    >
      {/* Header skeleton */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 mr-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      
      {/* Info skeleton */}
      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
        </div>
      </div>
      
      {/* Footer skeleton */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCardSkeleton;