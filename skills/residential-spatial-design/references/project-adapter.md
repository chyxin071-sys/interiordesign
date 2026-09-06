# 复用本项目

示例仓库：https://github.com/chyxin071-sys/interiordesign

技能位于 `skills/residential-spatial-design/`。在本仓库内使用时从仓库根目录读取项目文件；技能单独安装后没有自带完整 Viewer，需要可访问的项目副本或自行建立等效实现。

## 可复用模块

- `lib/spatial/plan.ts`：示例住宅的比例、边界、墙体、门窗、房间、家具占位；新平面图必须替换这些数据。
- `lib/spatial/model.ts`：建筑母模型与固定构件生成。
- `lib/spatial/design-data.ts`：设计布局、风格、机位与光照预设。
- `lib/spatial/design.ts`：家具几何与全屋设计层生成。
- `lib/spatial/viewer.ts`：实时显示、导航、编辑和导出。
- `app/page.tsx`、`components/`：界面。检查是否含有旧户型文案、空间 ID、机位和尺度。
- `public/source-plan.png`、`public/references/`：示例输入；新项目使用用户本次输入，不把示例图当作新任务资料。
- `scripts/validate-model.mjs`、`scripts/validate-design.mjs`：先读脚本，再根据新户型更新验证对象与预期。

复用的是结构和可核验模块，不是旧住宅坐标或旧检查结论。当前编辑与剖切实现应按编辑与验证规范重新验收，不把已有代码当成免检标准组件。

## 运行和交付

从 `package.json` 确认 Node 版本与命令。当前项目使用 Node >=22.13、npm、TypeScript、Three.js、React 与 Vinext。已有 lockfile 时使用 `npm ci`；`npm run dev` 预览，`npx tsc --noEmit` 检查类型，`npm run build` 构建。验证脚本可能重写模型或报告，检查差异后交付。

本项目含 `.openai/hosting.json`，在支持 Sites 的环境中遵循可用 Sites 技能进行部署。新项目不得继承示例项目的部署 ID、远程仓库或凭据；在原项目内续作则复用其现有配置。无托管工具时交付本地运行入口和构建文件，不编造发布地址。

向用户授权的 GitHub 仓库推送普通提交，避免覆盖远程已有内容。发布包来自已验证源码；源代码推送成功后读取完整 HEAD，再用同一提交保存发布版本。确认部署成功才能报告上线。

## 续作状态建议

在项目内维护一份简短状态文件：输入来源、比例依据、建筑版本、已确认阶段、方案列表、当前修改、验证结果和下一步。原始尺寸不明的项目保持推断标记；用户修正应更新空间数据并重新检查相关几何与动线。
