import {camera, renderer} from "./main.js";
import {update} from "./update.js";

export function loop() {
	requestAnimationFrame(loop);

	delta = (now = performance.now()) - then;
	then = now;

	update(delta);
	renderer.render(camera);
}

let now, then = performance.now(), delta;