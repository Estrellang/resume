# Resume Generator

一个可自行部署的在线简历编辑器。它提供实时编辑、三套模板、主题色、中英文内容、配置导入导出、分享链接和浏览器打印 PDF。项目目前以稳定现有能力为主，重构计划见 [ROADMAP.md](./ROADMAP.md)，已知限制见 [TODO.md](./TODO.md)。

## 项目信息

| 项目     | 当前值                                                           |
| -------- | ---------------------------------------------------------------- |
| 名称     | Resume Generator                                                 |
| 在线站点 | <https://estrellang.github.io/resume/>                           |
| 源码仓库 | <https://github.com/Estrellang/resume>                           |
| 许可证   | MIT；保留上游作者与当前维护者的版权声明，见 [LICENSE](./LICENSE) |

## 环境要求

- Node.js 20（仓库中的 `.nvmrc` 为准）
- pnpm 10.8.1（`package.json#packageManager` 为准）

不使用 npm 或 Yarn 更新依赖；仓库只维护 `pnpm-lock.yaml`。

## 本地开发

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

打开终端输出的本地地址，并追加 `?mode=edit` 进入编辑模式。常用检查命令：

```bash
pnpm typecheck
pnpm format:check
pnpm build
```

`pnpm clean` 可删除 Gatsby 的本地产物。更完整的基线验证结果见 [BASELINE.md](./BASELINE.md)。

## 使用方式

编辑模式下可直接修改示例内容，并通过“复制配置”或“保存简历”导出 JSON。只读模式默认从 GitHub 的 `https://raw.githubusercontent.com/{user}/{user}/{branch}/resume.json` 读取简历。

| 参数       | 说明                                    | 默认值      |
| ---------- | --------------------------------------- | ----------- |
| `user`     | GitHub 用户名；远程仓库名与用户名相同   | 站点维护者  |
| `branch`   | `resume.json` 所在分支                  | `master`    |
| `template` | `template1`、`template2` 或 `template3` | `template1` |
| `mode`     | 设置为 `edit` 进入编辑模式；缺省为只读  | 只读        |
| `lang`     | `zh-CN` 或 `en-US`                      | `zh-CN`     |

例如：

```text
https://estrellang.github.io/resume/?user={user}&branch={branch}
```

## 项目配置

项目没有运行时必填环境变量。构建时可使用以下变量覆盖 fork 的公开信息；变量只用于公开站点配置，不要在其中存放密钥。

| 变量                    | 默认值                                 | 用途                                    |
| ----------------------- | -------------------------------------- | --------------------------------------- |
| `GATSBY_SITE_OWNER`     | `Estrellang`                           | 默认 GitHub 用户和页脚维护者            |
| `GATSBY_SITE_URL`       | `https://estrellang.github.io/resume/` | 正式站点地址                            |
| `GATSBY_REPOSITORY_URL` | `https://github.com/Estrellang/resume` | 项目源码链接                            |
| `GATSBY_PATH_PREFIX`    | `/resume`                              | GitHub Pages 子路径；用户站点可设为 `/` |

可复制 `.env.example` 为 `.env.development` 或 `.env.production` 后修改。当前项目未启用 Google Analytics，也不读取统计 ID；若以后重新接入，需要同时更新隐私说明。

## 构建与部署

生产构建统一使用：

```bash
pnpm build
```

产物位于 `public/`，构建会应用 `GATSBY_PATH_PREFIX`。仓库的 `.github/workflows/deploy.yml` 在 `master` 分支推送后使用 pnpm 构建并发布到 GitHub Pages，也支持手动触发。首次部署前请在仓库设置中允许 GitHub Actions 写入 Pages 分支，并确认上表中的站点地址和路径前缀与仓库名一致。

维护者也可以在具有仓库写权限的本地环境运行 `pnpm deploy`，它会重新构建并把 `public/` 发布到 `gh-pages` 分支。

## 目录职责

- `src/components/`：可复用界面组件和简历模板。
- `src/data/`：默认简历、站点信息和表单模块定义等静态配置。
- `src/helpers/`：无界面依赖的读取、保存、导出与数据处理函数。
- `src/hooks/`：React 状态与交互逻辑。
- `src/i18n/`：语言检测、文案注册和翻译资源。
- `src/layout/`：页面级页头与页脚。
- `src/pages/`：Gatsby 页面入口。
- `src/types/`：跨模块类型声明。

## 贡献约定

1. 从 `master` 创建分支并保持改动范围单一。
2. 提交前运行 `pnpm typecheck`、`pnpm format:check` 和 `pnpm build`。
3. 改动 URL 参数或 JSON 结构时说明兼容影响；暂不处理的问题记录到 [TODO.md](./TODO.md)。

## 技术栈

Gatsby 2、React 17、TypeScript、Ant Design、Less、FormatJS、Prettier、Husky 和 lint-staged。当前版本较旧但已建立可运行基线，依赖升级会按路线图单独进行。
