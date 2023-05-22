import {Renderer} from "src";
import {Vector2} from "src/math";

const renderer = new Renderer();

function resize() {
	renderer.setViewport(new Vector2(512, 512));
	renderer.resize();
}

addEventListener("resize", resize);
resize();

await renderer.build();

document.body.appendChild(renderer.getCanvas());

renderer.render();