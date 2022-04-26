import { html } from 'hybrids';
import { Ndjinn } from '../..';
import { rgb_hsl, shiftHue, scale } from '../../math/color';

const fn = ({ r, g, b, a }: any, mode, deg): any[] => {
	const hsl = { ...rgb_hsl({ r, g, b }), a: a != null ? a : 1 };
	mode = Math.max(2, mode % 6);
	deg %= 360;

	const outputs = [
		scale(hsl, { h: 360 }),
		scale(shiftHue(hsl, deg / 360), { h: 360 }),
		scale(mode < 3 ? hsl : shiftHue(hsl, (2 * deg) / 360), { h: 360 }),
		scale(mode < 4 ? hsl : shiftHue(hsl, (3 * deg) / 360), { h: 360 }),
		scale(mode < 5 ? hsl : shiftHue(hsl, (4 * deg) / 360), { h: 360 }),
	];
	return outputs;
};

export const Polyad = Ndjinn.component(
	fn,
	[{r: 0, g: 0, b: 0, a: 0}, 2, 60],
	{
		in: [
			{ type: 'rgba', name: 'rgba' },
			{ type: 'num', name: 'mode', field: true },
			{ type: 'num', name: 'deg', field: true },
		],
		out: [
			{ type: 'hsla', name: 'A' },
			{ type: 'hsla', name: 'B' },
			{ type: 'hsla', name: 'C' },
			{ type: 'hsla', name: 'D' },
			{ type: 'hsla', name: 'E' },
		],
		component: {
			render: ({ node, fields }) => html`<form>
				<div class="field">
					<cam-swatch r="${node.inputs[0].r}" g="${node.inputs[0].g}" b="${node.inputs[0].b}" hide-label></cam-swatch>
				</div>
				<div class="field">
					<select
						value="${node.inputs[1]}"
						onchange="${(host, e) =>
							host.set({ mode: parseInt(e.target.value) })
						}">
						<option value="2">Diad</option>
						<option value="3">Triad</option>
						<option value="4">Tetrad</option>
						<option value="5">Pentad</option>
					</select>
				</div>
				<div class="field">
					<cam-input
						type="number"
						value="${fields[1].value}"
						min="0"
						max="360"
						step="1"
						wrap
						onupdate="${(host, e) => host.set({ deg: parseFloat(e.detail) })}"
						disabled="${fields[1].mode !== 'EDIT'}"></cam-input>
				</div>
			</form>`.css`
				cam-swatch::part(swatch) {
					min-height: 1.4rem;
					height: 1.4rem;
				}
				.field {
					margin-bottom: 0.25rem;
				}
			`,
		}
	}
);
