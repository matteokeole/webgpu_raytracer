import {clamp, Matrix4, PI, Vector2, Vector3} from "src/math";

export class Camera {
	/** @type {Number} */
	static TURN_VELOCITY = .0008;

	/**
	 * @private
	 * @type {Matrix4}
	 */
	#projection;

	/**
	 * @private
	 * @type {Matrix4}
	 */
	#projectionInverse;

	/**
	 * @private
	 * @type {Matrix4}
	 */
	#view;

	/**
	 * @private
	 * @type {Matrix4}
	 */
	#viewInverse;

	/**
	 * @private
	 * @type {Vector3}
	 */
	#position;

	/**
	 * @private
	 * @type {Vector3}
	 */
	#rotation;

	/**
	 * @private
	 * @type {Vector3}
	 */
	#forward;

	/**
	 * @private
	 * @type {Vector3}
	 */
	#up;

	/**
	 * @private
	 * @type {Vector3}
	 */
	#right;

	/**
	 * @private
	 * @type {Number}
	 */
	#fov;

	/**
	 * @private
	 * @type {Number}
	 */
	#aspect;

	/**
	 * @private
	 * @type {Number}
	 */
	#near;

	/**
	 * @private
	 * @type {Number}
	 */
	#far;

	constructor(fov, aspect, near, far) {
		this.#projection = new Matrix4();
		this.#projectionInverse = new Matrix4();
		this.#view = new Matrix4();
		this.#viewInverse = new Matrix4();

		this.#position = new Vector3();

		this.#rotation = new Vector3();
		this.#forward = new Vector3(0, 0, -1);
		this.#up = new Vector3(0, 1, 0);
		this.#right = new Vector3(1, 0, 0);

		this.#fov = fov * PI / 180;
		this.#aspect = aspect;
		this.#near = near;
		this.#far = far;
	}

	/** @returns {Matrix4} */
	getProjection() {
		return this.#projection;
	}

	/** @param {Matrix4} projection */
	setProjection(projection) {
		this.#projection = projection;
	}

	/** @returns {Matrix4} */
	getProjectionInverse() {
		return this.#projectionInverse;
	}

	/** @param {Matrix4} projectionInverse */
	setProjectionInverse(projectionInverse) {
		this.#projectionInverse = projectionInverse;
	}

	/** @returns {Matrix4} */
	getView() {
		return this.#view;
	}

	/** @param {Matrix4} view */
	setView(view) {
		this.#view = view;
	}

	/** @returns {Matrix4} */
	getViewInverse() {
		return this.#viewInverse;
	}

	/** @param {Matrix4} viewInverse */
	setViewInverse(viewInverse) {
		this.#viewInverse = viewInverse;
	}

	/** @returns {Vector3} */
	getPosition() {
		return this.#position;
	}

	/** @param {Vector3} position */
	setPosition(position) {
		this.#position = position;
	}

	/** @returns {Vector3} */
	getRotation() {
		return this.#rotation;
	}

	/** @param {Vector3} rotation */
	setRotation(rotation) {
		this.#rotation = rotation;
	}

	/** @returns {Vector3} */
	getForward() {
		return this.#forward;
	}

	/** @param {Vector3} forward */
	setForward(forward) {
		this.#forward = forward;
	}

	/** @returns {Vector3} */
	getUp() {
		return this.#up;
	}

	/** @param {Vector3} up */
	setUp(up) {
		this.#up = up;
	}

	/** @returns {Vector3} */
	getRight() {
		return this.#right;
	}

	/** @param {Vector3} right */
	setRight(right) {
		this.#right = right;
	}

	/** @param {Number} aspect */
	setAspect(aspect) {
		this.#aspect = aspect;
	}

	/** @param {Number} n */
	truck(n) {
		this.#position.add(this.#right.clone().multiplyScalar(n));
	}

	/** @param {Number} n */
	pedestal(n) {
		this.#position.add(this.#up.clone().multiplyScalar(n));
	}

	/** @param {Number} n */
	dolly(n) {
		this.#position.add(this.#forward.clone().multiplyScalar(n));
	}

	/** @param {Vector2} delta */
	lookAt(delta) {
		delta.multiplyScalar(Camera.TURN_VELOCITY);

		const pitch = -delta[1];
		const yaw = delta[0];

		this.#rotation[0] = clamp(this.#rotation[0] + pitch, -PI * .5, PI * .5);
		this.#rotation[1] += yaw;

		this.#forward = new Vector3(
			-Math.sin(this.#rotation[1]),
			Math.sin(this.#rotation[0]),
			-Math.cos(this.#rotation[1]),
		);
		this.#right = this.#forward.cross(this.#up);
	}

	project() {
		const fov = this.#fov;
		const aspect = this.#aspect;
		const near = this.#near;
		const far = this.#far;

		const f = 1 / Math.tan(-fov * .5);

		this.#projection = new Matrix4(
			f / aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (far + near) / (near - far), -1,
			0, 0, (far * near * 2) / (near - far), 0,
		);
		this.#projectionInverse = this.#projection.invert();
	}

	view() {
		const eye = this.#position.clone();
		const target = eye.clone().add(this.#forward);

		const z = eye.subtract(target).normalize();
		const x = this.#up.cross(z).normalize();
		const y = z.cross(x);

		this.#view = new Matrix4(
			x[0], y[0], z[0], 0,
			x[1], y[1], z[1], 0,
			x[2], y[2], z[2], 0,
			-x.dot(eye), -y.dot(eye), -z.dot(eye), 1,
		);
		this.#viewInverse = this.#view.invert();
	}
}