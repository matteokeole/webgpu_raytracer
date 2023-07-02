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

	if (keys.has("KeyW")) camera.moveZ(velocity);
	if (keys.has("KeyS")) camera.moveZ(-velocity);
	if (keys.has("KeyA")) camera.truck(-velocity);
	if (keys.has("KeyD")) camera.truck(velocity);
	if (keys.has("Space")) camera.moveY(velocity);
	if (keys.has("ControlLeft")) camera.moveY(-velocity);

	camera.position = camera.target
		.clone()
		.lerp(camera.position, Camera.LERP_FACTOR);
	camera.update();

	// Cancel accumulation on camera movement
	if (!nearequals(camera.target, camera.position, .025)) accumulate = false;

	// Cancel accumulation on camera rotation
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
const nearequals = (v1, v2, margin) => {
	const diff = v2.clone().subtract(v1);

	return Math.abs(diff[0]) < margin && Math.abs(diff[1]) < margin && Math.abs(diff[2]) < margin;
};
let velocity, accumulate, prevDirection = new Vector3();