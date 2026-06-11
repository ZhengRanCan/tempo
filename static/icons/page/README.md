# Page Icons

This directory stores page-specific icon assets.

Current page folders:

- `today/`: icons used only by the today task page.

Rules:

- Put page-specific icons under `static/icons/page/<page-name>/`.
- Promote an icon to `static/icons/common/` only after it is reused by more than one page.
- Each page icon folder should keep its own `README.md` and `icon-spec.json`.
- Do not scatter page icons under `pages/` or `components/`.

SVG sources can be exported into this directory with:

```powershell
python tools/icon-export/export_icons.py
```
