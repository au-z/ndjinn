import {defineConfig} from 'vite'
import CssHmr from '../build/rollup-plugin-css-hmr.js'

export default defineConfig({
	plugins: [
		{
			...CssHmr('.ts'),
			enforce: 'post',
		}
	],
})