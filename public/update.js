import {Camera} from "src";
import {VELOCITY, VELOCITY_SQRT1_2, keys, camera} from "./main.js";

export function update(delta) {
	velocity = (diagonalMovement() ? VELOCITY_SQRT1_2 : VELOCITY) * delta;

	if (keys.has("KeyW")) camera.moveZ(velocity);
	if (keys.has("KeyS")) camera.moveZ(-velocity);
	if (keys.has("KeyA")) camera.truck(-velocity);
	if (keys.has("KeyD")) camera.truck(velocity);
	if (keys.has("Space")) camera.moveY(velocity);
	if (keys.has("ControlLeft")) camera.moveY(-velocity);
	
	camera.position = camera.target
		.clone()
		.lerp(camera.position, Camera.LERP_FACTOR);
	camera.project();
	camera.view();

	window["debug-position"].textContent = [...camera.position].map(e => e.toFixed(2)).join(' ');
	window["debug-rotation"].textContent = [...camera.rotation].map(e => e.toFixed(2)).join(' ');
	window["debug-forward"].textContent = [...camera.getForward()].map(e => e.toFixed(2)).join(' ');
	window["debug-right"].textContent = [...camera.getRight()].map(e => e.toFixed(2)).join(' ');
	window["debug-up"].textContent = [...camera.getUp()].map(e => e.toFixed(2)).join(' ');
}

const diagonalMovement = () =>
	(keys.has("KeyW") || keys.has("KeyS")) &&
	(keys.has("KeyA") || keys.has("KeyD"));
let velocity;