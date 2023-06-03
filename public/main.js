import {Camera, Renderer} from "src";
import {Vector2} from "src/math";
import {listen} from "./events.js";
import {start} from "./loop.js";

export const renderer = new Renderer();
export const camera = new Camera();

renderer.resize(new Vector2(innerWidth, innerHeight));

await renderer.build();

renderer.camera = camera;

document.body.appendChild(renderer.getCanvas());

listen();
start();