import {Camera} from "src";
import {Vector3} from "src/math";
import {VELOCITY, VELOCITY_SQRT1_2, keys, camera} from "./main.js";

/**
 * @param {Number} delta
 * @returns {Boolean}
 */
export function update(delta) {
	velocity = (diagonalMovement() ? VELOCITY_SQRT1_2 : VELOCITY) * delta;
	needsUpdate = false;

	if (keys.has("KeyW")) {
		camera.moveZ(velocity);
		needsUpdate = true;
	}
	if (keys.has("KeyS")) {
		camera.moveZ(-velocity);
		needsUpdate = true;
	}
	if (keys.has("KeyA")) {
		camera.truck(-velocity);
		needsUpdate = true;
	}
	if (keys.has("KeyD")) {
		camera.truck(velocity);
		needsUpdate = true;
	}
	if (keys.has("Space")) {
		camera.moveY(velocity);
		needsUpdate = true;
	}
	if (keys.has("ControlLeft")) {
		camera.moveY(-velocity);
		needsUpdate = true;
	}

	camera.position = camera.target
		.clone()
		.lerp(camera.position, Camera.LERP_FACTOR);
	if (camera.update());

	if (!equals(prevDirection, camera.getForward())) needsUpdate = true;

	prevDirection = camera.getForward().clone();

	window["debug-position"].textContent = [...camera.position].map(e => e.toFixed(2)).join(' ');
	window["debug-rotation"].textContent = [...camera.rotation].map(e => e.toFixed(2)).join(' ');
	window["debug-forward"].textContent = [...camera.getForward()].map(e => e.toFixed(2)).join(' ');
	window["debug-right"].textContent = [...camera.getRight()].map(e => e.toFixed(2)).join(' ');
	window["debug-up"].textContent = [...camera.getUp()].map(e => e.toFixed(2)).join(' ');

	return needsUpdate;
}

const diagonalMovement = () =>
	(keys.has("KeyW") || keys.has("KeyS")) &&
	(keys.has("KeyA") || keys.has("KeyD"));
const equals = (v1, v2) => v1[0] === v2[0] && v1[1] === v2[1] && v1[2] === v2[2];
let velocity, needsUpdate, prevDirection = new Vector3();