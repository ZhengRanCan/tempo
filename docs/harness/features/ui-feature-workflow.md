# UI Feature Workflow

本文档用于固化后续小程序 UI feature 的推荐写法，目标是让 agent 在改 UI 时既有明确视觉目标，也不会被过量文档淹没。

## 1. 已尝试过的 UI 改法

### 1.1 复杂 UI 说明文档

代表 feature：

- F25 今日任务页重设计
- F26 任务日历页重设计

特点：

- 文档提供完整页面定位、结构、组件、状态、数据依赖和验收规则。
- 适合复杂页面，能减少 agent 对业务边界的误读。
- 缺点是上下文较重，容易让 agent 把所有条目都当成同等优先级。
- 当页面规范、feature 合同、细节文档同时很长时，agent 可能抓不住首屏视觉目标。

适用场景：

- 页面业务复杂。
- 数据状态多。
- 需要明确大量 out-of-scope 边界。
- 设计目标还没有稳定成参考图。

### 1.2 参考图为主，少量文字说明

代表 feature：

- F27 创建目标页重设计

特点：

- 上下文轻，执行成本低。
- 参考图能直接表达视觉风格、信息密度和组件顺序。
- 缺点是 agent 可能只做表面相似，缺少对组件层级、图标用途和数据边界的理解。
- 当参考图中存在多个区块、多个状态或多个图标语义时，单靠图片不够稳定。

适用场景：

- 页面结构简单。
- 用户愿意通过人工验收多轮微调。
- feature 目标主要是视觉调整，而不是复杂状态表达。

### 1.3 参考图 + 分层组件说明

代表 feature：

- F28 我的页重设计

特点：

- 参考图负责视觉方向。
- 分层组件说明负责拆解页面结构、每层职责、每层图标和 CSS-owned 内容。
- 文档量可控，比完整页面规范轻。
- agent 更容易知道“页面由几块组成、每块要放什么、哪些图标必须准备、哪些内容不能做成业务逻辑”。
- 当前项目中，这种方式的完成效果最好，返工成本最低。

适用场景：

- 已经有清晰参考图。
- 页面由多个卡片或区块组成。
- 需要接入图标资源。
- 需要避免 agent 把 UI mock 扩展成 models/services 改动。

## 2. 为什么后续优先选择第三种

后续 UI feature 默认优先使用“参考图 + 分层组件说明”，原因如下：

1. 参考图能直接约束视觉结果。
2. 分层说明能把图片拆成可执行结构，降低 agent 只改颜色、圆角、阴影的风险。
3. 图标清单提前确定，能减少实现阶段临时找图标和命名混乱。
4. 每层都能写清楚哪些是静态视觉、哪些是 CSS、哪些是真数据，避免 UI feature 越界修改 services 或 models。
5. 文档量比完整页面规范更轻，不容易让 feature 上下文膨胀。
6. 验收时可以同时对照参考图和分层说明，比单纯看 acceptance 更具体。

第三种不是要求像素级还原。它要求 agent 至少还原：

- 页面区块数量和顺序。
- 首屏视觉重心。
- 每层的信息密度。
- 主要卡片层级。
- 图标锚点。
- 主次按钮层级。
- 空状态和 mock 边界。

## 3. 推荐 UI 修改流程

后续新增 UI feature 时，按以下流程准备材料。

### Step 1: 生成完整 UI 参考图

先在 GPT 网页或其他设计辅助工具中生成一张完整的页面参考图。

参考图应尽量包含：

- 页面顶部原生导航或标题位置。
- 首屏完整布局。
- 主要业务卡片。
- 次要信息区。
- 底部入口或 TabBar 相对位置。
- 典型有数据状态。

注意：

- 不要只生成单个组件图。
- 不要只生成空状态图。
- 不要只给风格图。
- 如果页面有关键空状态，可以额外生成第二张参考图，但默认先保证主状态图清楚。

### Step 2: 从 iconfont 找参考图相关图标

根据参考图逐层识别需要的图标。

图标选择规则：

- 优先选择同一 iconfont 风格体系下的图标。
- 保持线宽、圆角、视觉重量一致。
- 图标只作为扫描锚点，不替代文字。
- 状态、进度、选中态、标签、分割线、卡片边框优先用 CSS，不单独找 SVG。
- 不为每个小装饰都找图标，避免页面变乱。

图标源文件应放在：

```text
tools/icon-export/source/page/<page-name>/
```

命名规则：

- 使用 ASCII 小写 kebab-case。
- 不使用中文文件名。
- 不使用 provider 原始乱码名。
- 不使用空格。
- 示例：`goal-hero.svg`、`progress-chart.svg`、`calendar.svg`。

### Step 3: 生成图标 manifest

找到 SVG 后，为该页面生成 `icon-spec.json`。

推荐路径：

```text
static/icons/page/<page-name>/icon-spec.json
static/icons/page/<page-name>/README.md
```

`icon-spec.json` 需要说明：

- `scope`
- `directory`
- 输出格式和尺寸。
- palette。
- SVG source 到 PNG output 的映射。
- CSS-owned states。
- style rules。

示例：

```json
{
  "scope": "page/profile",
  "directory": "static/icons/page/profile",
  "format": "png",
  "background": "transparent",
  "canvasPx": {
    "width": 64,
    "height": 64
  },
  "glyphTargetPx": 48,
  "icons": [
    {
      "source": "goal.svg",
      "name": "goal.png",
      "semantic": "current goal section marker",
      "paletteRef": "primaryAccent"
    }
  ],
  "cssOwnedStates": [
    "status chip",
    "progress bar"
  ]
}
```

生成或检查 PNG：

```powershell
python tools/icon-export/export_icons.py validate --group page/<page-name>
python tools/icon-export/export_icons.py export --group page/<page-name> --dry-run
python tools/icon-export/export_icons.py export --group page/<page-name>
```

### Step 4: 编写分层组件说明文档

在 feature 目录中新增：

```text
docs/harness/features/individual_feature/Fxx-xxx/details/component-layout.md
```

该文档只负责说明参考图怎么拆，不写完整产品愿景。

推荐结构：

```markdown
# Fxx Component Layout

## 1. Purpose

说明本文档只负责把参考图拆成可执行 UI 层级。

## 2. Page Structure

列出页面从上到下有几个部分。

## 3. Icon Resource Contract

说明 source SVG、static PNG、manifest 路径。

## 4. Layer 1: xxx

- Role
- Required icons
- Content
- Rules
- MVP

## 5. Layer 2: xxx

同上。

## CSS-Owned Visuals

列出哪些内容用 CSS。

## Out Of Scope

列出不能改 models/services/storage/planner/AI 等内容。

## Reference Check

列出实现后如何和参考图对照。
```

### Step 5: 编写 feature.md

`feature.md` 只管任务边界，不重复完整设计。

必须包含：

- Goal。
- User outcome。
- Required reading。
- Scope。
- Must change。
- Acceptance。
- Completion rule。

`feature.md` 应引用：

- 参考图路径。
- `details/component-layout.md`。
- `verification.md`。
- 图标 README 或 manifest。

### Step 6: 编写 verification.md

`verification.md` 只管完成证明。

UI feature 必须包含：

- 自动化命令。
- 构建入口检查。
- 参考图对照。
- 分层组件对照。
- 人工视觉确认。
- knownUnverified 记录规则。

没有截图或用户人工确认时，不应直接 passing。

## 4. 推荐目录结构

```text
docs/harness/features/individual_feature/Fxx-page-redesign/
  feature.md
  verification.md
  details/
    component-layout.md
  ref/
    image/
      README.md
  evidence/
    visual-check.md

tools/icon-export/source/page/<page-name>/
  icon-a.svg
  icon-b.svg

static/icons/page/<page-name>/
  README.md
  icon-spec.json
  icon-a.png
  icon-b.png
```

## 5. Passing Rule For UI Feature

UI feature 不能只因为测试通过就 passing。

必须同时满足：

- 自动化命令通过。
- 构建入口确认。
- 参考图对照完成。
- 分层组件对照完成。
- 图标资源路径和导出结果确认。
- 用户人工视觉确认或截图证据存在。
- 已记录与参考图不一致的地方。
- 已确认未越界修改 models/services/storage/planner/replanner/AI/tarot。

如果只改了颜色、圆角、阴影，但页面结构、首屏重心和组件层级没有明显变化，不能 passing。
