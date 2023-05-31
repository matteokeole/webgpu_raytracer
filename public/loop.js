import {renderer} from "./main.js";
import {update} from "./update.js";

export function loop() {
	// requestAnimationFrame(loop);

	now = performance.now();
	delta = now - then;
	then = now;

	update(delta);
	renderer.render();
}

let now, then = performance.now(), delta;