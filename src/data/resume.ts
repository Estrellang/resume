import type { ResumeConfig } from '@/types/resume';

/** 无真实个人信息的默认示例，用于本地编辑和功能验证。 */
export const RESUME_INFO: ResumeConfig = {
  avatar: {
    src: undefined,
    hidden: false,
  },
  profile: {
    name: '示例姓名',
    email: 'name@example.com',
    mobile: '138 0000 0000',
    github: '',
    zhihu: '',
    workExpYear: '5 年',
    workPlace: '上海',
    positionTitle: '前端工程师',
  },
  educationList: [
    {
      edu_time: ['2013.09', '2017.06'],
      school: '示例大学',
      major: '计算机科学与技术',
      academic_degree: '本科',
    },
  ],
  awardList: [
    { award_info: '英语 CET6', award_time: '2016' },
    { award_info: '年度优秀员工', award_time: '2022' },
  ],
  workExpList: [
    {
      company_name: '示例科技有限公司',
      department_name: '产品研发部',
      work_time: ['2021.07', null],
      work_desc:
        '1. 负责核心 Web 产品的架构与交付\n2. 推动组件复用和前端质量建设\n3. 与产品、设计和后端团队协作完成需求落地',
    },
    {
      company_name: '示例网络有限公司',
      department_name: '前端团队',
      work_time: ['2017.07', '2021.06'],
      work_desc: '参与企业管理平台开发，负责业务模块、数据展示和性能优化。',
    },
  ],
  skillList: [
    {
      skill_name: 'HTML 和 CSS',
      skill_desc: '能够实现响应式页面和可维护的样式体系',
      skill_level: 85,
    },
    {
      skill_name: 'TypeScript / JavaScript',
      skill_desc: '熟悉现代 JavaScript 与 TypeScript 工程实践',
      skill_level: 90,
    },
    {
      skill_name: 'React',
      skill_desc: '具备复杂应用和组件库开发经验',
      skill_level: 88,
    },
    {
      skill_name: '前端工程化',
      skill_desc: '熟悉构建、测试、发布和性能优化流程',
      skill_level: 82,
    },
  ],
  projectList: [
    {
      project_name: '企业协作平台',
      project_role: '前端负责人',
      project_time: '2022.03 - 至今',
      project_desc: '面向企业团队的协作与信息管理平台。',
      project_content:
        '负责前端架构、核心模块开发和交付流程建设，持续改善加载速度与使用体验。',
    },
    {
      project_name: '数据分析系统',
      project_role: '核心开发者',
      project_time: '2020.01 - 2022.02',
      project_desc: '帮助业务人员完成指标查询和可视化分析。',
      project_content:
        '负责图表组件、筛选器和报表页面，沉淀可复用的数据展示能力。',
    },
  ],
  workList: [],
  aboutme: {
    aboutme_desc:
      '关注产品体验和工程质量，能够独立推进复杂前端需求，并与跨职能团队高效协作。',
  },
  locales: {
    'en-US': {
      profile: {
        name: 'Sample Name',
        email: 'name@example.com',
        mobile: '+86 138 0000 0000',
        github: '',
        zhihu: '',
        workExpYear: '5 years',
        workPlace: 'Shanghai',
        positionTitle: 'Frontend Engineer',
      },
      educationList: [
        {
          edu_time: ['2013.09', '2017.06'],
          school: 'Example University',
          major: 'Computer Science',
          academic_degree: "Bachelor's Degree",
        },
      ],
      awardList: [
        { award_info: 'CET6', award_time: '2016' },
        { award_info: 'Employee of the Year', award_time: '2022' },
      ],
      workExpList: [
        {
          company_name: 'Example Technology Co., Ltd.',
          department_name: 'Product Engineering',
          work_time: ['2021.07', null],
          work_desc:
            '1. Led the architecture and delivery of a core web product\n2. Improved component reuse and frontend quality\n3. Collaborated across product, design, and backend teams',
        },
        {
          company_name: 'Example Network Co., Ltd.',
          department_name: 'Frontend Team',
          work_time: ['2017.07', '2021.06'],
          work_desc:
            'Built business modules and data views for an enterprise platform, with a focus on performance.',
        },
      ],
      skillList: [
        {
          skill_name: 'HTML and CSS',
          skill_desc: 'Responsive interfaces and maintainable styling systems',
          skill_level: 85,
        },
        {
          skill_name: 'TypeScript / JavaScript',
          skill_desc: 'Modern JavaScript and TypeScript engineering practices',
          skill_level: 90,
        },
        {
          skill_name: 'React',
          skill_desc: 'Complex applications and reusable component libraries',
          skill_level: 88,
        },
        {
          skill_name: 'Frontend Engineering',
          skill_desc: 'Build, test, release, and performance workflows',
          skill_level: 82,
        },
      ],
      projectList: [
        {
          project_name: 'Enterprise Collaboration Platform',
          project_role: 'Frontend Lead',
          project_time: '2022.03 - Present',
          project_desc:
            'A collaboration and information management platform for enterprise teams.',
          project_content:
            'Led frontend architecture, core feature development, and delivery improvements.',
        },
        {
          project_name: 'Analytics System',
          project_role: 'Core Developer',
          project_time: '2020.01 - 2022.02',
          project_desc:
            'A metrics exploration and visualization system for business users.',
          project_content:
            'Built chart components, filters, and reusable reporting capabilities.',
        },
      ],
      workList: [],
      aboutme: {
        aboutme_desc:
          'Focused on product experience and engineering quality, with experience delivering complex frontend work across teams.',
      },
    },
  },
};
