import {Vector2} from "src/math";
import {keys, camera, renderer} from "./main.js";

export function listen() {
	addEventListener("click", function({target}) {
		if (target !== renderer.getCanvas()) return;

		renderer.lock();
	});

	document.addEventListener("pointerlockchange", function() {
		if (renderer.isLocked()) {
			addEventListener("keydown", keydown);
			addEventListener("keyup", keyup);
			addEventListener("mousemove", mousemove);
		} else {
			removeEventListener("keydown", keydown);
			removeEventListener("keyup", keyup);
			removeEventListener("mousemove", mousemove);

			keys.clear();
		}
	});
}

const keydown = ({code}) => void keys.add(code);
const keyup = ({code}) => void keys.delete(code);

function mousemove({movementX, movementY}) {
	movement[0] = movementX;
	movement[1] = movementY;

	camera.lookAt(movement);
}

const movement = new Vector2();