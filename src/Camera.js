import {Matrix4, PI, Vector2, Vector3} from "src/math";

export class Camera {
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
	#direction;

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
		this.#projection = Matrix4.identity();
		this.#projectionInverse = Matrix4.identity();
		this.#view = Matrix4.identity();
		this.#viewInverse = Matrix4.identity();
		this.#position = new Vector3();
		this.#rotation = new Vector3();
		this.#direction = new Vector3();
		this.#fov = fov;
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
	getDirection() {
		return this.#direction;
	}

	/** @param {Vector3} direction */
	setDirection(direction) {
		this.#direction = direction;
	}

	/** @param {Number} aspect */
	setAspect(aspect) {
		this.#aspect = aspect;
	}

	/** @param {Number} n */
	truck(n) {
		const right = this.#direction.cross(new Vector3(0, 1, 0));

		this.#position.add(right.multiplyScalar(n));
	}

	/** @param {Number} n */
	pedestal(n) {
		const up = new Vector3(0, 1, 0);

		this.#position.add(up.multiplyScalar(n));
	}

	/** @param {Number} n */
	dolly(n) {
		this.#position.add(this.#direction.clone().multiplyScalar(n));
	}

	/** @param {Vector2} delta */
	lookAt(delta) {
		delta.multiplyScalar(.001);

		const pitchDelta = -delta[1];
		const yawDelta = delta[0];

		this.#rotation[0] += yawDelta;
		this.#rotation[1] += pitchDelta;

		this.#direction = new Vector3(
			-Math.sin(this.#rotation[0]),
			Math.sin(this.#rotation[1]),
			-Math.cos(this.#rotation[0]),
		);
	}

	project() {
		const fov = this.#fov * PI / 180;
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
		const target = eye.clone().add(this.#direction);
		const up = new Vector3(0, 1, 0);

		const z = eye.subtract(target).normalize();
		const x = up.cross(z).normalize();
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