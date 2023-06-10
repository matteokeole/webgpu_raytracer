import {Camera} from "src";
import {Vector3} from "src/math";
import {VELOCITY, VELOCITY_SQRT1_2, keys, camera} from "./main.js";

/**
 * @param {Number} delta
 * @returns {Boolean}
 */
export function update(delta) {
	velocity = (diagonalMovement() ? VELOCITY_SQRT1_2 : VELOCITY) * delta;
	accumulate = true;

	if (keys.has("KeyW")) {
		camera.moveZ(velocity);
		accumulate = false;
	}
	if (keys.has("KeyS")) {
		camera.moveZ(-velocity);
		accumulate = false;
	}
	if (keys.has("KeyA")) {
		camera.truck(-velocity);
		accumulate = false;
	}
	if (keys.has("KeyD")) {
		camera.truck(velocity);
		accumulate = false;
	}
	if (keys.has("Space")) {
		camera.moveY(velocity);
		accumulate = false;
	}
	if (keys.has("ControlLeft")) {
		camera.moveY(-velocity);
		accumulate = false;
	}

	camera.position = camera.target
		.clone()
		.lerp(camera.position, Camera.LERP_FACTOR);
	if (camera.update());

	if (!equals(prevDirection, camera.getForward())) accumulate = false;

	prevDirection = camera.getForward();

	window["debug-position"].textContent = [...camera.position].map(e => e.toFixed(2)).join(' ');
	window["debug-rotation"].textContent = [...camera.rotation].map(e => e.toFixed(2)).join(' ');
	window["debug-forward"].textContent = [...camera.getForward()].map(e => e.toFixed(2)).join(' ');
	window["debug-right"].textContent = [...camera.getRight()].map(e => e.toFixed(2)).join(' ');
	window["debug-up"].textContent = [...camera.getUp()].map(e => e.toFixed(2)).join(' ');

	return accumulate;
}

const diagonalMovement = () =>
	(keys.has("KeyW") || keys.has("KeyS")) &&
	(keys.has("KeyA") || keys.has("KeyD"));
const equals = (v1, v2) => v1[0] === v2[0] && v1[1] === v2[1] && v1[2] === v2[2];
let velocity, accumulate, prevDirection = new Vector3();