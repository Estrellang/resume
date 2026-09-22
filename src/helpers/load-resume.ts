import { message } from 'antd';
import type { ResumeConfig, ThemeConfig } from '@/types/resume';
import { RESUME_INFO } from '@/data/resume';
import { intl } from '@/i18n';
import { fetchResume } from './fetch-resume';
import { validateResumeConfig } from './resume-schema';
import { loadDraftFromLocalStorage } from './store-to-local';

export type EditableResume = {
  resume: ResumeConfig;
  theme?: ThemeConfig;
  source: 'draft' | 'remote' | 'example';
  savedAt?: number;
};

/**
 * 编辑模式的数据加载策略：本地草稿 -> 远程配置 -> 内置示例。
 * 各数据源只负责读取，回退顺序在这里统一编排。
 */
export async function loadEditableResume(
  lang: string,
  branch: string,
  user: string
): Promise<EditableResume> {
  const localDraft = loadDraftFromLocalStorage(user);
  if (localDraft) {
    const { theme, ...resume } = localDraft.file;
    return {
      resume,
      theme,
      source: 'draft',
      savedAt: localDraft.savedAt,
    };
  }

  try {
    return {
      resume: await fetchResume(lang, branch, user),
      source: 'remote',
    };
  } catch (_error) {
    message.warn(intl.formatMessage({ id: '从模板中获取' }), 1);
    return {
      resume: validateResumeConfig(RESUME_INFO),
      source: 'example',
    };
  }
}
