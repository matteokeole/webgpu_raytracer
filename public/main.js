import {Camera, Renderer} from "src";
import {SQRT1_2, Vector2, Vector3} from "src/math";
import {listen} from "./events.js";
import {start} from "./loop.js";

export const FIELD_OF_VIEW = 45;
export const ASPECT_RATIO = innerWidth / innerHeight;
export const NEAR = .1;
export const FAR = 100;
export const VELOCITY = .01;
export const VELOCITY_SQRT1_2 = VELOCITY * SQRT1_2;
export const renderer = new Renderer();
export const camera = new Camera(FIELD_OF_VIEW, ASPECT_RATIO, NEAR, FAR);
export const keys = new Set();

camera.position = camera.target = new Vector3(0, 0, -6);

renderer.camera = camera;
renderer.resize(new Vector2(innerWidth, innerHeight));

await renderer.build();

document.body.firstElementChild.appendChild(renderer.getCanvas());

listen();
start();