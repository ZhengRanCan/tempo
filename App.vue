<script setup lang="ts">
</script>

<template>
  <view class="app-shell">
    <slot />
  </view>
</template>

<style lang="scss">
@use "./styles/ui" as ui;

page {
  min-height: 100%;
  background: ui.$canvas;
  color: ui.$ink;
  font-family: ui.$font-family;
}

.app-shell {
  min-height: 100%;
}
</style>
