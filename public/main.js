import {Renderer} from "src";
import {Vector2} from "src/math";
import {start} from "./loop.js";

export const renderer = new Renderer();

renderer.resize(new Vector2(innerWidth, innerHeight));

await renderer.build();

document.body.appendChild(renderer.getCanvas());

start();