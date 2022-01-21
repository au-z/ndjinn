import { DT } from "@ndjinn/core";
import { html } from "hybrids";
import * as THREE from "three";
import { Scene } from "three";
import { NodeComponent } from "../node/base/node-base";

function initialize({inputs}, canvas: HTMLCanvasElement) {
	const camera: THREE.PerspectiveCamera = inputs[0].value
	const scene: THREE.Scene = inputs[1].value

	const renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true})
	renderer.setClearColor(0xffffff, 0)

	canvas.addEventListener('resize', resize)
	function resize() {
		const W = canvas.clientWidth
		const H = canvas.clientHeight
		renderer.setSize(W, H, false)
		camera.aspect = W / H
		camera.updateProjectionMatrix()
	}
	resize()

	camera.position.set(0, 0, 3)
	camera.lookAt(new THREE.Vector3(0, 0, 0))

	scene.add(new THREE.AxesHelper(1))

	draw(scene)
	function draw(scene) {
		renderer.render(scene, camera)
		requestAnimationFrame(draw)
	}
}

const render = ({inputs}) => html`
	<canvas class="viewer"></canvas>
`

export const Viewer = NodeComponent((camera, scene) => [], [
	new THREE.PerspectiveCamera(45, 1, 0.01, 100),
	new THREE.Scene(),
], {
	in: [
		{name: 'cam', type: DT.any},
		{name: 'scene', type: DT.any},
	],
	component: {
		canvas: {
			get: ({render}) => render().querySelector('canvas'),
			observe: (host, canvas) => {
				initialize(host, canvas)
			}
		},
		render,
	}
})