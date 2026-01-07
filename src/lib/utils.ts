import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 学习进度管理工具函数
export function getCompletedSteps(): number[] {
  try {
    const saved = localStorage.getItem('S1_progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.completedSteps || [];
    }
    return [];
  } catch (error) {
    console.error('Failed to get completed steps:', error);
    return [];
  }
}

export function markStepCompleted(stepId: number): void {
  try {
    const completedSteps = getCompletedSteps();
    if (!completedSteps.includes(stepId)) {
      completedSteps.push(stepId);
      localStorage.setItem('S1_progress', JSON.stringify({
        completedSteps
      }));
    }
  } catch (error) {
    console.error('Failed to mark step as completed:', error);
  }
}

export function isStepCompleted(stepId: number): boolean {
  const completedSteps = getCompletedSteps();
  return completedSteps.includes(stepId);
}

// 获取步骤的路由路径
export function getStepRoute(topicId: string, stepId: number): string {
  const routes = [
    '/topic/:id',
    '/topic/:id/background-reading',
    '/topic/:id/initial-intuition',
    '/topic/:id/perspective-puzzle',
    '/topic/:id/argument-analysis',
    '/topic/:id/dialogue-simulation',
    '/topic/:id/meta-cognition',
    '/topic/:id/position-review'
  ];
  
  if (stepId >= 1 && stepId <= routes.length) {
    return routes[stepId - 1].replace(':id', topicId);
  }
  
  return '/';
}

// 记录最近学习页面
export interface LastVisitedLearningPage {
  topicId: string;
  topicTitle: string;
  stepId: number;
  routePath: string;
  visitedAt: number;
}

const LAST_PAGE_KEY = 'ControvLearn_lastLearningPage';

export function updateLastVisitedLearningPage(data: LastVisitedLearningPage): void {
  try {
    localStorage.setItem(LAST_PAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('[ControvLearn] Failed to save last learning page', error);
  }
}

export function getLastVisitedLearningPage(): LastVisitedLearningPage | null {
  try {
    const saved = localStorage.getItem(LAST_PAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  } catch (error) {
    console.warn('[ControvLearn] Failed to read last learning page', error);
    return null;
  }
}

// 学习统计数据结构
export interface LearningStats {
  goalTopics: number;
  completedTopics: number;
  participatedTopics: number;
  inProgressTopics: number;
  progressPercent: number;
}

// 获取学习统计数据的hook
export function useLearningStats(topics: any[]): LearningStats {
  // 确保topics是数组
  const safeTopics = (topics || []).filter(Boolean);
  
  // 基础常量
  const BASE_GOAL_TOPICS = 6;
  const FIXED_COMPLETED_TOPICS = 2;
  
  // AI 议题数量 - 安全检查
  const aiTopicsCount = safeTopics.filter(t => t && t.source === 'ai').length;
  
  // 计算派生数据
  const goalTopics = BASE_GOAL_TOPICS + aiTopicsCount;
  const completedTopics = FIXED_COMPLETED_TOPICS;
  const participatedTopics = goalTopics;
  const inProgressTopics = Math.max(participatedTopics - completedTopics, 0);
  const progressPercent = goalTopics > 0
    ? Math.round((completedTopics / goalTopics) * 100)
    : 0;
  
  return {
    goalTopics,
    completedTopics,
    participatedTopics,
    inProgressTopics,
    progressPercent
  };
}