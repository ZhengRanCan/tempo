<script setup lang="ts">
</script>

<template>
  <view class="app-shell">
    <slot />
  </view>
</template>

<style lang="scss">
page {
  min-height: 100%;
  background: #f8f4ec;
  color: #28312f;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.app-shell {
  min-height: 100%;
}
</style>
