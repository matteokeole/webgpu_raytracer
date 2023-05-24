import {Camera, Renderer} from "src";
import {Vector2, Vector3} from "src/math";
import "./events.js";
import {loop} from "./loop.js";

export const FIELD_OF_VIEW = 90;
export const ASPECT_RATIO = innerWidth / innerHeight;
export const NEAR = .1;
export const FAR = 100;
export const VELOCITY = .007;
export const renderer = new Renderer();
export const camera = new Camera(FIELD_OF_VIEW, ASPECT_RATIO, NEAR, FAR);
export const keys = new Set();

renderer.setViewport(new Vector2(innerWidth, innerHeight));
await renderer.build();
renderer.resize();

camera.setPosition(new Vector3(0, 0, 10));
camera.setDirection(new Vector3(0, 0, -1));

document.body.appendChild(renderer.getCanvas());
loop();