import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
  ],
  theme: {
    colors: {
      red: {
        50: '#fef2f2',
        100: '#fee2e2',
        500: '#e74c3c', // Primary brand color
        600: '#c0392b', // Darker shade for hover
      },
      primary: '#e74c3c',
    }
  },
  shortcuts: {
    'btn': 'px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer',
    'btn-primary': 'bg-[#e74c3c] text-white hover:bg-red-600',
    'btn-outline': 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    'input': 'w-full rounded-md border-gray-300 border p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all',
    'card': 'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden',
  }
})
