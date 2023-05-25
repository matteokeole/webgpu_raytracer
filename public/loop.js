import {camera, renderer} from "./main.js";
import {update} from "./update.js";

export function loop() {
	requestAnimationFrame(loop);

	now = performance.now();
	delta = now - then;
	then = now;

	update(delta);
	renderer.render(camera);
}

let now, then = performance.now(), delta;