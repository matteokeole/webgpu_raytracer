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

scene.setSpheres([
	new Sphere({
		position: new Vector3(.75, 0, 0),
		radius: .75,
		albedo: new Vector3(.75, .34, .22),
	}),
	new Sphere({
		position: new Vector3(-.75, 0, 0),
		radius: .5,
		albedo: new Vector3(1, 0, 1),
	}),
]);

renderer.setViewport(new Vector2(innerWidth, innerHeight));
await renderer.build(scene.getSpheres().length);
renderer.resize();

camera.setPosition(new Vector3(0, 0, 3));

document.body.appendChild(renderer.getCanvas());
loop();