import {Vector2, Vector3} from "src/math";

export function Camera() {
	this.position = new Vector3(0, 0, 0);
	this.direction = new Vector3(0, 0, 1);

	let right = Camera.RIGHT.clone();

	/** @param {Number} x */
	this.truck = function(x) {
		this.position.add(right.clone().multiplyScalar(x));
	};

	/** @param {Vector2} delta */
	this.look = function(delta) {
		const yaw = delta[0] * .002;

		this.direction[1] = Math.sin(yaw);

		right = Camera.RIGHT.clone().multiplyScalar(this.direction);
	}
}

/** @type {Vector3} */
Camera.FORWARD = new Vector3(0, 0, 1);

/** @type {Vector3} */
Camera.UP = new Vector3(0, 1, 0);

/** @type {Vector3} */
Camera.RIGHT = new Vector3(1, 0, 0);