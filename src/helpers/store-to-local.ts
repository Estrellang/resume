import type { ResumeConfig, ResumeFile } from '@/types/resume';
import { validateResumeConfig } from './resume-schema';

export const LOCAL_KEY = (user?: string) => `${user ?? ''}resume-config`;
export const LOCAL_META_KEY = (user?: string) => `${LOCAL_KEY(user)}-metadata`;

export type LocalDraft = {
  file: ResumeFile;
  savedAt?: number;
};

export function loadDraftFromLocalStorage(
  user: string
): LocalDraft | undefined {
  if (typeof localStorage !== 'undefined') {
    const config = localStorage.getItem(LOCAL_KEY(user));
    try {
      if (config) {
        const metadata = localStorage.getItem(LOCAL_META_KEY(user));
        const savedAt = metadata
          ? Number((JSON.parse(metadata) as { savedAt?: number }).savedAt)
          : undefined;
        return {
          file: validateResumeConfig(JSON.parse(config)),
          savedAt: Number.isFinite(savedAt) ? savedAt : undefined,
        };
      }
    } catch (_error) {
      // 无效缓存不阻断启动，继续尝试远程数据或内置示例。
    }
  }
  return undefined;
}

/** 兼容旧调用方，只返回简历主体。 */
export function loadFromLocalStorage(user: string): ResumeConfig | undefined {
  const draft = loadDraftFromLocalStorage(user);
  if (!draft) return undefined;
  const { theme: _theme, ...resume } = draft.file;
  return resume;
}

/** localStorage 是同步存储；时间戳用于界面提示最近一次成功保存。 */
export function saveToLocalStorage(user: string, file: ResumeFile): number {
  if (typeof localStorage === 'undefined') return 0;
  const savedAt = Date.now();
  localStorage.setItem(LOCAL_KEY(user), JSON.stringify(file));
  localStorage.setItem(LOCAL_META_KEY(user), JSON.stringify({ savedAt }));
  return savedAt;
}
