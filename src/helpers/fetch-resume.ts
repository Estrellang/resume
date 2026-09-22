import fetch from 'cross-fetch';
import type { ResumeConfig } from '@/types/resume';
import { splitResumeFile, validateResumeConfig } from './resume-schema';

export function fetchResume(
  _lang: string,
  branch: string,
  user: string
): Promise<ResumeConfig> {
  return fetch(
    `https://raw.githubusercontent.com/${user}/${user}/${branch}/resume.json`
  )
    .then(data => {
      if (data.status !== 200) {
        return Promise.reject(new Error());
      }
      return data.json();
    })
    .then(data => splitResumeFile(validateResumeConfig(data)).resume);
}
