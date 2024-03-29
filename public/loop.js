import {renderer} from "./main.js";
import {update} from "./update.js";

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
		const accumulate = update(delta);

		renderer.render(accumulate);
	} catch (error) {
		stop();

		throw error;
	}
}

let request, delta, now, then;