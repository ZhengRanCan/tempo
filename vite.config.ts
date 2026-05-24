import { defineConfig } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'
import type { Plugin } from 'vite'

type UniPluginFactory = () => Plugin[]

const uni = (
  typeof uniModule === 'function'
    ? uniModule
    : (uniModule as { default: UniPluginFactory }).default
) as UniPluginFactory

export default defineConfig({
  plugins: [uni()]
})
