export const CURRENT_RESUME_SCHEMA_VERSION = 1;

export type ResumeSchemaVersion = typeof CURRENT_RESUME_SCHEMA_VERSION;

export type Avatar = {
  src?: string;
  shape?: 'circle' | 'square';
  size?: 'large' | 'small' | 'default' | number;
  hidden?: boolean;
};

export type Profile = {
  name: string;
  mobile?: string;
  email?: string;
  github?: string;
  zhihu?: string;
  /** 工作经验 xx 年 */
  workExpYear?: string;
  /** 期望工作地 */
  workPlace?: string;
  /** 职位 */
  positionTitle?: string;
};

export type Education = {
  edu_time: [string | undefined, string | number | null];
  school: string;
  major?: string;
  /** 学历 */
  academic_degree?: string;
};

export type WorkExperience = {
  company_name: string;
  department_name: string;
  work_time: [string | undefined, string | number | null];
  work_desc: string;
};

export type ProjectExperience = {
  project_name: string;
  project_role: string;
  project_desc?: string;
  project_content?: string;
  project_time?: string;
};

export type Skill = {
  skill_name?: string;
  skill_level?: number;
  skill_desc?: string;
};

export type Award = {
  award_info: string;
  award_time?: string;
};

export type Work = {
  work_name?: string;
  work_desc?: string;
  visit_link?: string;
};

export type AboutMe = {
  aboutme_desc: string;
};

export type CustomSection = {
  id: string;
  title: string;
  items: Array<{
    title?: string;
    subtitle?: string;
    description?: string;
  }>;
};

export type ResumeTitleNameMap = {
  educationList?: string;
  workExpList?: string;
  projectList?: string;
  skillList?: string;
  awardList?: string;
  workList?: string;
  aboutme?: string;
};

/** 简历配置内容 */
export type ResumeConfig = {
  /** 数据结构版本，用于导入时执行兼容迁移。 */
  schemaVersion: ResumeSchemaVersion;

  /** 头像 */
  avatar?: Avatar;

  /** 个人信息 */
  profile?: Profile;

  /** 标题名称映射 */
  titleNameMap?: ResumeTitleNameMap;

  /** 教育背景 */
  educationList?: Education[];

  /** 工作经历 */
  workExpList?: WorkExperience[];

  /** 项目经历 */
  projectList?: ProjectExperience[];

  /** 个人技能 */
  skillList?: Skill[];

  /** 更多信息 */
  awardList?: Award[];

  /** 作品 */
  workList?: Work[];

  /** 自我介绍 */
  aboutme?: AboutMe;

  /** 自定义模块，编辑和渲染支持将在后续阶段接入。 */
  customSections?: CustomSection[];

  /** 增加国际化 */
  locales?: {
    [key: string]: ResumeLocaleConfig;
  };

  template?: string;
};

export type ResumeLocaleConfig = Partial<
  Omit<ResumeConfig, 'schemaVersion' | 'locales'>
>;

/**
 * 主题配置，暂时只支持主题色
 */
export type ThemeConfig = {
  /** 主题色 */
  color: string;
  /** Tag 标签色 */
  tagColor: string;
};

/** 导入导出文件格式；主题不属于简历内容，但会随文件一起保存。 */
export type ResumeFile = ResumeConfig & { theme?: ThemeConfig };
