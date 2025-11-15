import { motion, AnimatePresence } from 'framer-motion';
import type { ActivityStep } from '../../types/user';

interface StepDetailsProps {
  steps: ActivityStep[];
  isExpanded: boolean;
}

/**
 * 步骤详情组件
 * 显示活动的每个步骤的详细信息
 */
export function StepDetails({ steps, isExpanded }: StepDetailsProps) {
  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            📋 Step Details
          </h4>
          
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-3 text-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900">
                    {formatStepName(step.stepName)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {step.model}
                  </span>
                </div>
                
                <div className="flex gap-4 text-xs text-gray-600">
                  <span>
                    📥 {step.tokensPrompt.toLocaleString()} tokens
                  </span>
                  <span>
                    📤 {step.tokensCompletion.toLocaleString()} tokens
                  </span>
                  <span className="text-purple-600 font-medium">
                    💬 {step.tokensTotal.toLocaleString()} total
                  </span>
                  {step.costUsd > 0 && (
                    <span className="text-green-600 font-medium">
                      💰 ${step.costUsd.toFixed(4)}
                    </span>
                  )}
                  <span>
                    ⏱️ {(step.durationMs / 1000).toFixed(2)}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * 格式化步骤名称
 */
function formatStepName(stepName: string): string {
  const nameMap: Record<string, string> = {
    main: 'Main Generation',
    list_names: 'List Names',
    isolate: 'Isolate Candidates',
    information: 'Research & Evaluation',
    decide: 'Decision & Ranking',
    story: 'Story Crafting',
  };
  
  return nameMap[stepName] || stepName;
}

