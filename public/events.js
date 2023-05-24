import {keys, camera, renderer} from "./main.js";
import {Vector2} from "src/math";

const keydown = ({code}) => void keys.add(code);
const keyup = ({code}) => void keys.delete(code);
const mousemove = ({movementX, movementY}) => camera.lookAt(new Vector2(movementX, movementY));

addEventListener("resize", function() {
	const width = innerWidth, height = innerHeight;

	camera.setAspect(width / height);
	renderer.setViewport(new Vector2(width, height));
	renderer.resize();
});

addEventListener("click", function({target}) {
	if (target === renderer.getCanvas()) renderer.lock();
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