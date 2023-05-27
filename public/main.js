import {Camera, Renderer, Scene, Sphere} from "src";
import {Vector2, Vector3} from "src/math";
import "./events.js";
import {loop} from "./loop.js";

export const FIELD_OF_VIEW = 45;
export const ASPECT_RATIO = innerWidth / innerHeight;
export const NEAR = .1;
export const FAR = 100;
export const VELOCITY = .007;
export const renderer = new Renderer();
export const scene = new Scene();
export const camera = new Camera(FIELD_OF_VIEW, ASPECT_RATIO, NEAR, FAR);
export const keys = new Set();

scene.addSphere(
	new Sphere({
		position: new Vector3(0, -11, 0),
		radius: 10,
		albedo: new Vector3(.2, .3, 1),
		roughness: .1,
		metallic: 0,
	}),
);

scene.addSphere(
	new Sphere({
		position: new Vector3(0, 0, 0),
		radius: 1,
		albedo: new Vector3(1, 0, 1),
		roughness: 0,
		metallic: 0,
	}),
);

camera.position = new Vector3(0, 0, 6);

renderer.scene = scene;
renderer.camera = camera;
renderer.viewport = new Vector2(innerWidth, innerHeight);

await renderer.build();
renderer.resize();

document.body.appendChild(renderer.getCanvas());
loop();