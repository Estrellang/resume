import { message } from 'antd';
import type { ResumeConfig } from '@/types/resume';
import _ from 'lodash-es';
import { splitResumeFile, validateResumeConfig } from './resume-schema';

export const LOCAL_KEY = (user?: string) => `${user ?? ''}resume-config`;

export function loadFromLocalStorage(user: string): ResumeConfig | undefined {
  if (typeof localStorage !== 'undefined') {
    const config = localStorage.getItem(LOCAL_KEY(user));
    try {
      if (config) {
        return splitResumeFile(validateResumeConfig(JSON.parse(config))).resume;
      }
    } catch (_error) {
      // 无效缓存不阻断启动，继续尝试远程数据或内置示例。
    }
  }
  return undefined;
}

export const saveToLocalStorage = _.throttle(
  (user: string, config: ResumeConfig, successMessage: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_KEY(user), JSON.stringify(config));
      message.success(successMessage, 0.65);
    }
  },
  5000
);
