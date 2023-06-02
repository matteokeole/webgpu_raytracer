import {Renderer} from "src";
import {Vector2} from "src/math";

export const renderer = new Renderer();

renderer.viewport = new Vector2(innerWidth, innerHeight);

await renderer.build();
renderer.resize();

document.body.appendChild(renderer.getCanvas());

renderer.render();