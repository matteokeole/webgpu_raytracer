import {keys, camera, renderer} from "./main.js";
import {Vector2} from "src/math";

const mouseMovement = new Vector2();

const keydown = ({code}) => void keys.add(code);
const keyup = ({code}) => void keys.delete(code);

function mousemove({movementX, movementY}) {
	mouseMovement[0] = movementX;
	mouseMovement[1] = movementY;

	camera.lookAt(mouseMovement);
}

/* addEventListener("resize", function() {
	const width = innerWidth, height = innerHeight;

	camera.aspect = width / height;
	renderer.viewport[0] = width;
	renderer.viewport[1] = height;
	renderer.resize();
});

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
}); */