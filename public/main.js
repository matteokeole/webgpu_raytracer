import {Renderer} from "src";
import {Vector2} from "src/math";

const renderer = new Renderer();

renderer.setViewport(new Vector2(innerWidth, innerHeight));
renderer.resize();
document.body.appendChild(renderer.getCanvas());

await renderer.build();

renderer.render();