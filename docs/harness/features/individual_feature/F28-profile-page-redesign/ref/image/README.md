# F28 Reference Image

F28 uses the existing project reference image:

```text
docs/design/page/reference_image/我的.png
```

This feature uses a different harness style from F27:

- Reference image defines the visual target.
- `details/component-layout.md` explains how to break the image into implementable page components.
- `feature.md` only controls task boundary and passing rules.

Use the image to judge:

- first-screen information order,
- component sequence from top to bottom,
- current-goal visual weight,
- preference cards and list density,
- setting-entry grouping,
- overall feel.

Do not require pixel-perfect restoration. Do not pass F28 if only color, radius, or shadow changed while the page still behaves like a generic entry list.
