import {
  CURRENT_RESUME_SCHEMA_VERSION,
  ResumeConfig,
  ResumeFile,
  ThemeConfig,
} from '@/types/resume';

type UnknownRecord = Record<string, unknown>;

const LIST_FIELDS = [
  'educationList',
  'workExpList',
  'projectList',
  'skillList',
  'awardList',
  'workList',
  'customSections',
] as const;

const OBJECT_FIELDS = [
  'avatar',
  'profile',
  'titleNameMap',
  'aboutme',
  'locales',
] as const;

export class ResumeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResumeValidationError';
  }
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const assertObjectField = (data: UnknownRecord, field: string) => {
  const value = data[field];
  if (value !== undefined && !isRecord(value)) {
    throw new ResumeValidationError(`字段 ${field} 必须是对象`);
  }
};

const assertListField = (data: UnknownRecord, field: string) => {
  const value = data[field];
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    throw new ResumeValidationError(`字段 ${field} 必须是数组`);
  }
  if (value.some(item => !isRecord(item))) {
    throw new ResumeValidationError(`字段 ${field} 中的每一项必须是对象`);
  }
};

const migrateTimeRanges = (data: UnknownRecord): UnknownRecord => {
  const normalize = (value: unknown) =>
    typeof value === 'string' ? value.split(',') : value;
  const migrateList = (field: string, timeField: string) => {
    const list = data[field];
    if (!Array.isArray(list)) return list;
    return list.map(item =>
      isRecord(item)
        ? { ...item, [timeField]: normalize(item[timeField]) }
        : item
    );
  };
  const migrated = { ...data };
  if (data.educationList !== undefined) {
    migrated.educationList = migrateList('educationList', 'edu_time');
  }
  if (data.workExpList !== undefined) {
    migrated.workExpList = migrateList('workExpList', 'work_time');
  }
  return migrated;
};

const assertTimeRanges = (
  data: UnknownRecord,
  listField: string,
  timeField: string
) => {
  const list = data[listField];
  if (!Array.isArray(list)) return;
  list.forEach((item, index) => {
    if (!isRecord(item)) return;
    const timeRange = item[timeField];
    if (!Array.isArray(timeRange) || timeRange.length > 2) {
      throw new ResumeValidationError(
        `字段 ${listField}[${index}].${timeField} 必须是长度不超过 2 的数组`
      );
    }
  });
};

const assertStringProperties = (
  data: UnknownRecord,
  field: string,
  properties: string[]
) => {
  const value = data[field];
  if (!isRecord(value)) return;
  properties.forEach(property => {
    if (value[property] !== undefined && typeof value[property] !== 'string') {
      throw new ResumeValidationError(`字段 ${field}.${property} 必须是字符串`);
    }
  });
};

const assertCustomSections = (data: UnknownRecord) => {
  const sections = data.customSections;
  if (!Array.isArray(sections)) return;
  sections.forEach((section, sectionIndex) => {
    if (!isRecord(section)) return;
    ['id', 'title'].forEach(field => {
      if (typeof section[field] !== 'string' || !section[field]) {
        throw new ResumeValidationError(
          `字段 customSections[${sectionIndex}].${field} 必须是非空字符串`
        );
      }
    });
    if (!Array.isArray(section.items)) {
      throw new ResumeValidationError(
        `字段 customSections[${sectionIndex}].items 必须是数组`
      );
    }
    section.items.forEach((item, itemIndex) => {
      if (!isRecord(item)) {
        throw new ResumeValidationError(
          `字段 customSections[${sectionIndex}].items[${itemIndex}] 必须是对象`
        );
      }
      ['title', 'subtitle', 'description'].forEach(field => {
        if (item[field] !== undefined && typeof item[field] !== 'string') {
          throw new ResumeValidationError(
            `字段 customSections[${sectionIndex}].items[${itemIndex}].${field} 必须是字符串`
          );
        }
      });
    });
  });
};

/** 创建不含示例个人信息的空数据，也作为缺省字段的唯一来源。 */
export const createEmptyResumeConfig = (): ResumeConfig => ({
  schemaVersion: CURRENT_RESUME_SCHEMA_VERSION,
  avatar: { hidden: false, shape: 'circle' },
  profile: { name: '' },
  titleNameMap: {},
  educationList: [],
  workExpList: [],
  projectList: [],
  skillList: [],
  awardList: [],
  workList: [],
  customSections: [],
  aboutme: { aboutme_desc: '' },
  locales: {},
  template: 'template1',
});

/** 将无版本的历史 JSON 迁移到当前版本。 */
export const migrateResumeConfig = (input: unknown): UnknownRecord => {
  if (!isRecord(input)) {
    throw new ResumeValidationError('简历配置必须是 JSON 对象');
  }

  const version = input.schemaVersion;
  if (version === undefined || version === 0) {
    return migrateTimeRanges({
      ...input,
      schemaVersion: CURRENT_RESUME_SCHEMA_VERSION,
    });
  }
  if (typeof version !== 'number' || !Number.isInteger(version)) {
    throw new ResumeValidationError('schemaVersion 必须是整数');
  }
  if (version > CURRENT_RESUME_SCHEMA_VERSION) {
    throw new ResumeValidationError(`当前应用不支持 schemaVersion ${version}`);
  }
  if (version < CURRENT_RESUME_SCHEMA_VERSION) {
    throw new ResumeValidationError(`暂无 schemaVersion ${version} 的迁移策略`);
  }
  return migrateTimeRanges({ ...input });
};

export const validateResumeConfig = (input: unknown): ResumeFile => {
  const data = migrateResumeConfig(input);

  OBJECT_FIELDS.forEach(field => assertObjectField(data, field));
  LIST_FIELDS.forEach(field => assertListField(data, field));
  assertTimeRanges(data, 'educationList', 'edu_time');
  assertTimeRanges(data, 'workExpList', 'work_time');
  assertCustomSections(data);

  if (data.template !== undefined && typeof data.template !== 'string') {
    throw new ResumeValidationError('字段 template 必须是字符串');
  }
  assertStringProperties(data, 'profile', [
    'name',
    'mobile',
    'email',
    'github',
    'zhihu',
    'workExpYear',
    'workPlace',
    'positionTitle',
  ]);
  assertStringProperties(data, 'aboutme', ['aboutme_desc']);

  if (isRecord(data.locales)) {
    Object.keys(data.locales).forEach(locale => {
      const localeConfig = data.locales as UnknownRecord;
      if (!isRecord(localeConfig[locale])) {
        throw new ResumeValidationError(`字段 locales.${locale} 必须是对象`);
      }
      const override = localeConfig[locale] as UnknownRecord;
      LIST_FIELDS.forEach(field => assertListField(override, field));
      assertCustomSections(override);
      OBJECT_FIELDS.filter(field => field !== 'locales').forEach(field =>
        assertObjectField(override, field)
      );
    });
  }

  if (data.theme !== undefined) {
    if (!isRecord(data.theme)) {
      throw new ResumeValidationError('字段 theme 必须是对象');
    }
    ['color', 'tagColor'].forEach(field => {
      if (typeof (data.theme as UnknownRecord)[field] !== 'string') {
        throw new ResumeValidationError(`字段 theme.${field} 必须是字符串`);
      }
    });
  }

  return { ...createEmptyResumeConfig(), ...data } as ResumeFile;
};

export const parseResumeFile = (source: string): ResumeFile => {
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch (_error) {
    throw new ResumeValidationError('文件不是有效的 JSON');
  }
  return validateResumeConfig(value);
};

export const splitResumeFile = (
  file: ResumeFile
): { resume: ResumeConfig; theme?: ThemeConfig } => {
  const { theme, ...resume } = file;
  return { resume, theme };
};
