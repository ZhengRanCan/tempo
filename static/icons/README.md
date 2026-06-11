# Icon Assets

This directory stores local image assets used by the mini-program UI.

Current structure:

- `tab/`: bottom TabBar icons.
- `page/today/`: today-page module icons.
- `common/`: shared UI icons.

Rules:

- Keep icon assets in a single source directory instead of scattering them under page folders.
- Use paired default and active assets for TabBar icons.
- Do not commit temporary generated icons as final assets unless the feature explicitly allows it.
- Each icon folder should keep a human-readable `README.md` and a machine-readable `icon-spec.json`.
- If folder-level docs conflict with a feature contract, stop and record the conflict before implementing.
