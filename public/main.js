import {Scene} from "src";
import {SQRT1_2, Vector2, Vector3} from "src/math";
import {Camera} from "./Camera.js";
import {Renderer} from "./Renderer.js";
import {listen} from "./events.js";
import {init} from "./init.js";
import {start} from "./loop.js";

const WIDTH = innerWidth;
const HEIGHT = innerHeight;
export const VELOCITY = .003;
export const VELOCITY_SQRT1_2 = VELOCITY * SQRT1_2;

const canvas = document.createElement("canvas");

export const renderer = new Renderer(canvas);
export const scene = new Scene();
export const camera = new Camera(60, WIDTH / HEIGHT, .1, 100);
export const keys = new Set();

init(scene);

camera.position = camera.targetPosition = new Vector3(1.42, 0, 2.20);
camera.rotation = new Vector3(-0.08, -2.50, 0);
camera.forward = new Vector3(-0.59, -0.08, -0.8);
camera.right = new Vector3(-0.8, 0, 0.6);
camera.up = new Vector3(-0.05, 1, -0.07);

renderer.scene = scene;
renderer.camera = camera;
renderer.resize(new Vector2(WIDTH, HEIGHT));

await renderer.initialize();

document.body.appendChild(renderer.getCanvas());

listen();
start();