# Icon Export Tool

这个工具用于把 SVG 图标按 `static/icons/**/icon-spec.json` 中的 manifest 规则导出为小程序可用的透明 PNG。

核心规则：

- SVG 只提供图标形状和透明度。
- SVG 原始颜色会被忽略。
- 最终 PNG 的颜色、尺寸、输出目录、文件名和状态变体都由 `icon-spec.json` 决定。
- 本工具只处理图标资源，不修改页面、组件、services、models、`pages.json`、`app.json`、`manifest.json` 或业务逻辑。

## 1. 运行方式

必须从项目根目录运行命令。

主入口是：

```text
tools/icon-export/export_icons.py
```

示例：

```powershell
python tools/icon-export/export_icons.py validate --group page/today
python tools/icon-export/export_icons.py export --group page/today
```

`export_icons.py` 是唯一应该直接运行的脚本。`icon_converter.py` 是内部转换模块，不是直接运行的 CLI 脚本。

当前脚本通过下面逻辑定位项目根目录：

```python
ROOT = Path(__file__).resolve().parents[2]
```

因此脚本应保留在 `tools/icon-export/` 下，不要复制到别的目录运行。

## 2. 文件职责

```text
tools/icon-export/
  icon_converter.py
  export_icons.py
  requirements.txt
  source/
```

- `export_icons.py`：命令入口，负责读取 manifest、校验资源、生成导出计划、处理 `validate` / `export` / `--group` / `--manifest` / `--dry-run`。
- `icon_converter.py`：底层单图标转换模块，只负责 SVG 渲染、alpha 裁剪、缩放、居中、重上色和 PNG 保存。

## 3. 安装依赖

在项目根目录运行：

```powershell
pip install -r tools/icon-export/requirements.txt
```

依赖：

- `Pillow`
- `cairosvg`

`validate` 和 `export --dry-run` 不需要真正渲染 SVG；实际 `export` 需要 `cairosvg`，并且本机需要可用的 Cairo 原生库。Windows 环境如果报 `no library called "cairo-2" was found`，说明 Python 包已安装，但 Cairo DLL/runtime 未安装或未进入 `PATH`。

## 4. Manifest 位置

`--group` 会按下面规则自动推导 manifest：

```text
--group <group> -> static/icons/<group>/icon-spec.json
```

示例：

| command | manifest |
|---|---|
| `--group tab` | `static/icons/tab/icon-spec.json` |
| `--group page/today` | `static/icons/page/today/icon-spec.json` |
| `--group page/calendar` | `static/icons/page/calendar/icon-spec.json` |
| `--group page/profile` | `static/icons/page/profile/icon-spec.json` |

`group` 必须是相对路径，不能是绝对路径，不能包含 `..`。推导出的 manifest 必须位于 `static/icons/` 下。

也可以用 `--manifest` 指定 manifest：

```powershell
python tools/icon-export/export_icons.py validate --manifest static/icons/page/today/icon-spec.json
python tools/icon-export/export_icons.py export --manifest static/icons/page/today/icon-spec.json
```

`--group` 和 `--manifest` 不能同时传入。

说明：`--manifest` 可以指向任意 JSON 路径，但 manifest 内的 `directory` 仍必须位于 `static/icons/` 下，否则 validate 会失败。

## 5. SVG 源文件位置

默认源目录由 manifest 的 `scope` 推导：

```text
scope -> tools/icon-export/source/<scope>/
```

示例：

| scope | source directory |
|---|---|
| `tab` | `tools/icon-export/source/tab/` |
| `page/today` | `tools/icon-export/source/page/today/` |
| `common` | `tools/icon-export/source/common/` |

如果 manifest 显式提供 `sourceDir`，优先使用 `sourceDir`。

## 6. SVG 颜色处理规则

SVG 原始颜色会被忽略。

`icon_converter.py` 的实际处理方式是：

1. 使用 CairoSVG 渲染 SVG。
2. 读取渲染结果的 alpha 通道作为 mask。
3. 按 alpha 裁剪出图标主体。
4. 按 `glyphTargetPx` 缩放。
5. 按 manifest 传入的颜色重新绘制。
6. 居中放入透明 PNG 画布。

所以，从 iconfont 下载的 SVG 是黑色、蓝色、红色都不重要。最终 PNG 都会按 `icon-spec.json` 中的 `paletteRef` 或 `color` 输出。

例如：

```json
{
  "palette": {
    "primaryAccent": "#6B5BEA"
  },
  "icons": [
    {
      "source": "sparkle.svg",
      "name": "sparkle.png",
      "paletteRef": "primaryAccent"
    }
  ]
}
```

无论 `sparkle.svg` 原来是什么颜色，最终 `sparkle.png` 都会输出为 `#6B5BEA`。

## 7. Manifest 字段

最小结构示例：

```json
{
  "scope": "page/today",
  "directory": "static/icons/page/today",
  "format": "png",
  "background": "transparent",
  "canvasPx": {
    "width": 64,
    "height": 64
  },
  "glyphTargetPx": 48,
  "palette": {
    "primaryAccent": "#6B5BEA",
    "neutral": "#77716A"
  },
  "icons": [
    {
      "source": "clock.svg",
      "name": "clock.png",
      "semantic": "estimated time",
      "paletteRef": "neutral"
    }
  ]
}
```

字段说明：

- `scope`：图标组范围，用于默认推导 SVG 源目录。
- `directory`：PNG 输出目录，必须位于 `static/icons/` 下。
- `format`：可选，默认 `png`；如果显式填写，必须是 `png`。
- `background`：可选，默认 `transparent`；如果显式填写，必须是 `transparent`。
- `canvasPx`：输出 PNG 画布尺寸，支持 `{ "width": 64, "height": 64 }`。
- `glyphTargetPx`：图标主体最大边目标尺寸；旧字段 `visualGlyphPx.max` 仍可兼容读取。
- `palette`：颜色 token，值必须是 `#RRGGBB`。
- `icons`：要导出的图标列表，是导出内容的唯一事实来源。
- `source`：源 SVG 文件名，相对当前 source directory。
- `name`：输出 PNG 文件名，可包含子目录，例如 `status/star.png`。
- `semantic`：图标语义说明，只用于设计和检查。
- `paletteRef`：引用 `palette` 中的颜色。
- `color`：可选，直接写 hex 颜色；如果同时存在 `paletteRef` 和 `color`，优先使用 `paletteRef`。
- `variants`：可选，用于 default / active 等多状态输出。

## 8. Variants 规则

`variants` 的值必须是 `palette` 中的 key，不是颜色值。

正确写法：

```json
{
  "palette": {
    "default": "#8A8176",
    "active": "#6B5BEA"
  },
  "icons": [
    {
      "source": "today.svg",
      "name": "today.png",
      "semantic": "tab today",
      "variants": {
        "default": "default",
        "active": "active"
      },
      "activeSuffix": "-active"
    }
  ]
}
```

这里右侧的 `"default"` 和 `"active"` 会被当成 `palette` key。脚本会输出：

```text
static/icons/tab/today.png
static/icons/tab/today-active.png
```

不要这样写：

```json
{
  "variants": {
    "default": "#8A8176",
    "active": "#6B5BEA"
  }
}
```

当前脚本不会把 `variants` 的值当成 hex color 解析，而是会当成 palette key。如果写 hex，会因为找不到对应 palette key 而失败。

## 9. TabBar 多状态规则

TabBar 的 default / active 图标由一个 SVG 生成两个 PNG，默认只改颜色，不改形状。这是强规则；如果 active 状态必须改形状，需要在 feature evidence 中记录原因并由用户确认。

## 10. 校验

校验 TabBar manifest：

```powershell
python tools/icon-export/export_icons.py validate --group tab
```

校验今日页 manifest：

```powershell
python tools/icon-export/export_icons.py validate --group page/today
```

校验后续新增页面 manifest：

```powershell
python tools/icon-export/export_icons.py validate --group page/calendar
```

直接校验指定 manifest：

```powershell
python tools/icon-export/export_icons.py validate --manifest static/icons/page/today/icon-spec.json
```

校验会检查：

- manifest 是否存在且 JSON 可解析；
- `scope`、`directory`、`format`、`background`、`canvasPx`、`glyphTargetPx` / `visualGlyphPx.max`、`icons` 是否有效；
- `directory` 是否位于 `static/icons/` 下；
- source directory 是否存在；
- manifest 中登记的 SVG 是否存在；
- `paletteRef` 是否能在 `palette` 中找到；
- `variants` 的值是否能在 `palette` 中找到；
- `palette` / `color` 是否为合法 hex；
- 输出 PNG 相对路径是否重复；
- source directory 中存在但未登记的 SVG 会打印 warning。

## 11. 预览导出

`--dry-run` 只打印将要输出的路径、颜色和 variant，不写 PNG：

```powershell
python tools/icon-export/export_icons.py export --group tab --dry-run
python tools/icon-export/export_icons.py export --group page/today --dry-run
python tools/icon-export/export_icons.py export --group page/calendar --dry-run
python tools/icon-export/export_icons.py export --manifest static/icons/page/today/icon-spec.json --dry-run
```

## 12. 实际导出

```powershell
python tools/icon-export/export_icons.py export --group tab
python tools/icon-export/export_icons.py export --group page/today
python tools/icon-export/export_icons.py export --group page/calendar
python tools/icon-export/export_icons.py export --manifest static/icons/page/today/icon-spec.json
```

`export` 会先执行与 `validate` 相同的校验。校验失败时不会写入 PNG。

## 13. 输出规则

- SVG 原始颜色会被忽略，只保留形状和透明度。
- 最终 PNG 颜色由 `icon-spec.json` 决定。
- PNG 会按 `canvasPx` 建透明画布。
- 图标主体会按 `glyphTargetPx` 等比缩放并居中。
- 脚本会生成或覆盖当前 manifest 中 SVG 对应的 PNG。
- 如果删除了某个 SVG 或从 manifest 移除了某个 icon，脚本不会自动删除 `static/icons/` 中旧 PNG。
- 输出文件超过 manifest 的 `maxFileKB` 或默认 40KB 时会打印 warning。

## 14. 旧配置兼容

旧的 `tools/icon-export/icon-export.config.json` 只保留为历史参考。当前主流程不再读取它；新增或修改图标时应更新对应 `static/icons/**/icon-spec.json`。

## 15. 最终资产确认

agent 可以生成临时占位图标用于本地验证，但不能把占位图标作为最终 passing evidence。最终图标来源、风格和授权需要用户确认。
