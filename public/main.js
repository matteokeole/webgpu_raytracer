import {Renderer} from "src";
import {Vector2} from "src/math";

export const renderer = new Renderer();

renderer.resize(new Vector2(innerWidth, innerHeight));

await renderer.build();

document.body.appendChild(renderer.getCanvas());

renderer.render();