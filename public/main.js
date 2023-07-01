import {Camera, Scene, Renderer} from "src";
import {SQRT1_2, Vector2, Vector3} from "src/math";
import {listen} from "./events.js";
import {init} from "./init.js";
import {start} from "./loop.js";

const WIDTH = innerWidth;
const HEIGHT = innerHeight;

export const FIELD_OF_VIEW = 45;
export const ASPECT_RATIO = WIDTH / HEIGHT;
export const NEAR = .1;
export const FAR = 100;
export const VELOCITY = .003;
export const VELOCITY_SQRT1_2 = VELOCITY * SQRT1_2;
export const renderer = new Renderer();
export const scene = new Scene();
export const camera = new Camera(FIELD_OF_VIEW, ASPECT_RATIO, NEAR, FAR);
export const keys = new Set();

init(scene);

camera.position = camera.target = new Vector3(0, 0, -6);

renderer.scene = scene;
renderer.camera = camera;
renderer.resize(new Vector2(WIDTH, HEIGHT));

await renderer.build();

document.body.firstElementChild.appendChild(renderer.getCanvas());

listen();
start();