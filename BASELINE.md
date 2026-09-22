# 项目基线

记录日期：2026-09-10

## 环境

- Node.js：20（`.nvmrc`；GitHub Actions 使用相同主版本）
- pnpm：10.8.1（`package.json#packageManager`）
- 应用框架：Gatsby 2.32.13、React 17、TypeScript 4.9
- 验证浏览器：Google Chrome（macOS，无界面模式）
- 部署目标：GitHub Pages，路径前缀 `/resume`

## 可复现验证

```bash
pnpm install --frozen-lockfile
pnpm start
pnpm exec tsc --noEmit
pnpm build
```

本次结果：锁定安装、开发服务器、类型检查和生产构建均通过。生产构建生成 `public/`，并保留 `/resume` 路径前缀。GitHub Pages 工作流使用 pnpm 锁定安装、Node.js 20 和同一构建命令；实际推送部署需要 GitHub Actions 环境和仓库 Pages 设置，因此本地只验证工作流配置与构建产物。

## 功能基线

| 场景     | URL 或操作               | 结果                                                             |
| -------- | ------------------------ | ---------------------------------------------------------------- |
| 编辑模式 | `/?mode=edit`            | 加载内置示例，显示配置、复制、导出、导入、打印和分享控件         |
| 只读模式 | `/?user={user}`          | 从 GitHub 同名仓库读取 `resume.json`；读取失败时提示进入编辑模式 |
| 模板切换 | `template=template1/2/3` | 三套模板均可由 URL 选择，界面切换会保留其他查询参数              |
| 语言切换 | `lang=zh-CN/en-US`       | 中英文文案和对应简历内容可切换                                   |
| 分支参数 | `branch={branch}`        | 默认 `master`，用于远程 `resume.json` 地址                       |
| 配置导入 | 编辑模式选择 `.json`     | 合法 JSON 应用到简历；格式错误显示提示                           |
| 配置导出 | 复制配置、保存简历       | 可复制 JSON 或下载本地 JSON 文件                                 |
| 分享数据 | `data={compressed}`      | 分享按钮把压缩配置写入 URL，编辑模式可还原                       |
| 本地保存 | 编辑表单                 | 配置按用户键节流写入 `localStorage`                              |

## 已知问题和旧行为

- Gatsby 2、部分 Babel 插件和 `gatsby-plugin-less` 已过维护期；安装与构建会出现废弃依赖、peer dependency 和兼容性警告，当前不阻塞运行。
- 当前锁文件需要将 `@mdx-js/util` 固定为 `2.0.0-next.8`；不固定时宽松依赖可能解析到缺少运行时代码的 `2.0.0`，导致开发服务器无法启动。
- 无 `user` 参数进入默认 URL 时，页面按旧行为先尝试只读远程数据并失败，再引导用户进入编辑模式；直接使用 `?mode=edit` 可加载内置示例。
- 只读远程加载依赖 GitHub Raw 的网络可用性和 `{user}/{user}/{branch}/resume.json` 约定。
- 编辑态模板与语言切换通过整页导航完成；语言切换前未导出的内存修改可能丢失，界面已有提醒。
- 移动端按旧行为仅推荐查看，不保证完整编辑体验。
- 模板缩略图和 Roboto 字体仍来自外部 CDN；离线或网络受限时可能缺失，但主体内容可继续渲染。
- PDF 通过浏览器打印实现，分页和 Safari/Edge 的视觉一致性尚未建立自动化截图基线，留待“模板与输出”阶段处理。

## 身份与隐私清理

- 已移除原作者 Google Analytics ID 和统计插件。
- 站点、仓库、页脚及 package 元数据已指向当前 fork。
- 默认简历已替换为无真实个人身份的中英文示例。
- 已删除仍指向原作者 Gitee 仓库且需要其密钥的镜像工作流。

## 基线版本

阶段完成后使用带注释标签 `baseline-v1.1.5` 标记提交。标签创建前可用 `git diff` 审核本阶段全部变更。
