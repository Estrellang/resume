import { message } from 'antd';
import type { ResumeConfig } from '@/types/resume';
import { RESUME_INFO } from '@/data/resume';
import { intl } from '@/i18n';
import { fetchResume } from './fetch-resume';
import { validateResumeConfig } from './resume-schema';
import { loadFromLocalStorage } from './store-to-local';

/**
 * 编辑模式的数据加载策略：本地草稿 -> 远程配置 -> 内置示例。
 * 各数据源只负责读取，回退顺序在这里统一编排。
 */
export async function loadEditableResume(
  lang: string,
  branch: string,
  user: string
): Promise<ResumeConfig> {
  const localResume = loadFromLocalStorage(user);
  if (localResume) return localResume;

  try {
    return await fetchResume(lang, branch, user);
  } catch (_error) {
    message.warn(intl.formatMessage({ id: '从模板中获取' }), 1);
    return validateResumeConfig(RESUME_INFO);
  }
}
