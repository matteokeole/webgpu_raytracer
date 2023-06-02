import {update} from "./update.js";
import {render} from "./render.js";

export function start() {
	delta = 0;
	now = null;
	then = performance.now();

	loop();
}

export function stop() {
	cancelAnimationFrame(request);

	request = null;
}

function loop() {
	request = requestAnimationFrame(loop);

	now = performance.now();
	delta = now - then;
	then = now;

	try {
		update(delta);
		render();
	} catch (error) {
		cancelAnimationFrame(request);

		throw error;
	}
}

let request, delta, now, then;