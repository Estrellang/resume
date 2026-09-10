## 🧾 Resume Generator

在线简历生成器。可以在线预览、编辑和下载 PDF 简历。✨ [在线编辑](https://estrellang.github.io/resume/)

内置 3 套模板，支持**自定义主题颜色**、**自定义模块标题**、**国际化(中/英)** 等.

## 技术栈（Tech stack）

- **应用框架**：Gatsby `2.32.13`，使用 Gatsby 生成和构建单页应用，并通过自定义 Webpack 配置提供 `@` 路径别名。
- **前端框架**：React `17.0.1`、React DOM `17.0.1`。
- **开发语言**：TypeScript `4.2.3`，结合 Babel 完成 TypeScript、JSX 和现代 JavaScript 语法转换。
- **组件与交互**：Ant Design `4.16.6`、`@ant-design/icons`、`react-color`、`react-dnd`，用于界面组件、主题颜色选择和拖拽编辑。
- **样式方案**：Less `4.1.0`，通过 `gatsby-plugin-less` 和 `gatsby-plugin-antd` 集成，并支持主题变量定制。
- **国际化与页面能力**：FormatJS / `react-intl`，支持中英文切换；`react-helmet` 用于管理页面标题等 head 信息。
- **数据与浏览器能力**：`query-string` 解析 URL 参数，`cross-fetch` 获取远程简历数据，`localStorage` 保存本地配置。
- **构建与发布**：pnpm 管理依赖，通过 GitHub Actions 发布到 GitHub Pages。
- **代码规范**：Prettier 格式化，Husky + lint-staged 在提交前处理 TypeScript 文件。

|默认模板| 简易模板| 简易模板2（适用于多页）|
| -------------------------------- | --------------------------------------------------|----------------------- |
| <img src="https://user-images.githubusercontent.com/15646325/147406773-d1583d83-b4ed-496a-9b7c-2fca8a5fc624.png" height="280" />|<img src="https://user-images.githubusercontent.com/15646325/147406862-19ac2b2a-6dcf-466f-a0dd-53fd1a6abccd.png" height="280" />| <img src="https://user-images.githubusercontent.com/15646325/147406903-19529fe9-9ef8-4877-8165-b2fad0e3b48a.png" height="280" />|
|[Live Demo](https://estrellang.github.io/resume/?mode=edit&template=template1)  |[Live Demo](https://estrellang.github.io/resume/?mode=edit&template=template2)|[Live Demo](https://estrellang.github.io/resume/?mode=edit&template=template3) |

## 如何使用（How to use）

**方式 1:**

在线编辑 -> 导出配置 -> 将“简历信息”存储为 GitHub 个人同名仓库中的 `resume.json`。

**方式 2:**

直接在自己的 GitHub 个人同名仓库中创建 `resume.json` 文件。

**最后**

访问 `https://estrellang.github.io/resume/?user={user}&branch={branch}`。

参数说明:

| 参数   | 描述          | 默认值       |
| ------ | ------------- | ------------ |
| user   | github 用户名 | 必选         |
| template | 模板        | 默认: template1 |
| branch | 分支名        | 默认: master |
| mode | 模式        | 备注: 默认为‘只读’模式，设置为: `mode=edit` 即可进入编辑模式 |
| lang | 语言        | 默认: zh-CN |

## 本地开发（Local develop）

```bash
# pnpm required, to see: https://pnpm.io/installation
# Install dependencies
pnpm install
# Then, start
pnpm start
```

推荐使用 Node.js 20 和 pnpm 10.8.1；仓库中的 `.nvmrc` 与 `packageManager` 字段记录了基线版本。详细验证结果见 [BASELINE.md](./BASELINE.md)。

## ✨ Recommendation

- [resumemaker](https://www.resumemaker.online/es.php)
- [Geek Resume - Pure Markdown, an online resume editor for developer.](https://www.jijian.press/)
