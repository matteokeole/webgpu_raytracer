import {renderer} from "./main.js";
import {Vector2} from "src/math";

addEventListener("resize", function() {
	renderer.viewport = new Vector2(innerWidth, innerHeight);
	renderer.resize();
	renderer.render();
});