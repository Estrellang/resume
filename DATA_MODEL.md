# 简历数据模型

简历 JSON 使用 `schemaVersion` 管理兼容性。当前版本为 `1`，类型定义位于 `src/types/resume.ts`，运行时迁移和校验位于 `src/helpers/resume-schema.ts`。

## 顶层结构

```json
{
  "schemaVersion": 1,
  "avatar": {},
  "profile": {},
  "educationList": [],
  "workExpList": [],
  "projectList": [],
  "skillList": [],
  "awardList": [],
  "workList": [],
  "customSections": [],
  "aboutme": {},
  "titleNameMap": {},
  "locales": {},
  "template": "template1"
}
```

`locales` 只保存对应语言的字段覆盖，不嵌套 `schemaVersion` 或下一层 `locales`。`theme` 不属于简历内容模型，但在导入导出文件中作为可选顶层字段一起保存。

## 默认值与空数据

`createEmptyResumeConfig()` 是空简历默认值的唯一来源。列表模块缺省为空数组，文本模块缺省为空字符串，头像默认不隐藏，模板默认为 `template1`。内置示例数据仍单独位于 `src/data/resume.ts`，不会被当作空值填充到用户简历。

## 导入与迁移

1. 解析 JSON。
2. 无 `schemaVersion` 的历史文件按版本 `0` 处理，自动迁移到版本 `1`。
3. 检查顶层对象、模块类型、列表项、多语言覆盖和主题配置。
4. 合并空数据默认值后再交给页面。

高于当前版本的数据会被拒绝，避免新版数据被旧版应用静默损坏。新增版本时，必须在 `migrateResumeConfig()` 中逐版增加迁移逻辑。

## 数据源边界

- `fetch-resume.ts`：读取并校验 GitHub Raw 远程数据。
- `store-to-local.ts`：只负责浏览器本地草稿的读写。
- `location.ts`：只负责解析 URL 参数。
- `load-resume.ts`：编排编辑模式的加载顺序：本地草稿、远程配置、内置示例。
- `resume-schema.ts`：是所有外部 JSON 进入渲染层前的统一边界。
