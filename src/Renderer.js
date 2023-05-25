import {Camera} from "src";
import {Vector2} from "src/math";

export class Renderer {
	/**
	 * @private
	 * @type {HTMLCanvasElement}
	 */
	#canvas;

	/**
	 * @private
	 * @type {Vector2}
	 */
	#viewport;

	/**
	 * @private
	 * @type {?GPUDevice}
	 */
	#device;

	/**
	 * @private
	 * @type {?GPUCanvasContext}
	 */
	#context;

	/**
	 * @private
	 * @type {GPUBuffer[]}
	 */
	#buffers;

	/**
	 * @private
	 * @type {?GPUComputePipeline}
	 */
	#computePipeline;

	/**
	 * @private
	 * @type {?GPURenderPipeline}
	 */
	#renderPipeline;

	/**
	 * @private
	 * @type {?GPUBindGroupLayout}
	 */
	#bindGroupLayout;

	/**
	 * @private
	 * @type {?GPUBindGroup}
	 */
	#bindGroup;

	constructor() {
		this.#canvas = document.createElement("canvas");
		this.#viewport = new Vector2();
		this.#buffers = [];
	}

	/** @returns {HTMLCanvasElement} */
	getCanvas() {
		return this.#canvas;
	}

	/** @returns {Vector2} */
	getViewport() {
		return this.#viewport;
	}

	/** @param {Vector2} viewport */
	setViewport(viewport) {
		this.#viewport = viewport;
	}

	async build() {
		if (navigator.gpu == null) throw "WebGPU not supported.";

		const adapter = await navigator.gpu.requestAdapter();

		if (adapter == null) throw "Couldn't request WebGPU adapter.";

		const device = this.#device = await adapter.requestDevice();
		const context = this.#context = this.#canvas.getContext("webgpu");
		const format = navigator.gpu.getPreferredCanvasFormat();

		context.configure({device, format});

		// Vertex buffer
		{
			const vertices = new Float32Array([
				-1,  1,
				 1,  1,
				-1, -1,
				 1,  1,
				 1, -1,
				-1, -1,
			]);

			this.#buffers.vertex = device.createBuffer({
				label: "Vertex buffer",
				size: vertices.byteLength,
				usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			});

			device.queue.writeBuffer(this.#buffers.vertex, 0, vertices);
		}

		// Viewport uniform buffer
		{
			this.#buffers.viewportUniform = device.createBuffer({
				label: "Viewport uniform buffer",
				size: this.#viewport.byteLength,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			});

			device.queue.writeBuffer(this.#buffers.viewportUniform, 0, this.#viewport);
		}

		// Projection inverse uniform buffer
		{
			this.#buffers.projectionInverseUniform = device.createBuffer({
				label: "Projection inverse uniform buffer",
				size: 64,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			});
		}

		// View inverse uniform buffer
		{
			this.#buffers.viewInverseUniform = device.createBuffer({
				label: "View inverse uniform buffer",
				size: 64,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			});
		}

		// Camera position uniform buffer
		{
			this.#buffers.cameraPositionUniform = device.createBuffer({
				label: "Camera position uniform buffer",
				size: 12,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			});
		}

		// Bind group layout/bind group
		{
			this.#bindGroupLayout = device.createBindGroupLayout({
				label: "Bind group layout",
				entries: [
					{
						binding: 0,
						visibility: GPUShaderStage.FRAGMENT,
						buffer: {
							type: "uniform",
						},
					}, {
						binding: 1,
						visibility: GPUShaderStage.FRAGMENT,
						buffer: {
							type: "uniform",
						},
					}, {
						binding: 2,
						visibility: GPUShaderStage.FRAGMENT,
						buffer: {
							type: "uniform",
						},
					}, {
						binding: 3,
						visibility: GPUShaderStage.FRAGMENT,
						buffer: {
							type: "uniform",
						},
					},
				],
			});

			this.#bindGroup = device.createBindGroup({
				label: "Bind group",
				layout: this.#bindGroupLayout,
				entries: [
					{
						binding: 0,
						resource: {
							buffer: this.#buffers.viewportUniform,
						},
					}, {
						binding: 1,
						resource: {
							buffer: this.#buffers.projectionInverseUniform,
						},
					}, {
						binding: 2,
						resource: {
							buffer: this.#buffers.viewInverseUniform,
						},
					}, {
						binding: 3,
						resource: {
							buffer: this.#buffers.cameraPositionUniform,
						},
					},
				],
			});
		}

		// Pipelines
		{
			const computeShaderModule = device.createShaderModule({
				label: "Compute shader module",
				code: await (await fetch("assets/shaders/compute.wgsl")).text(),
			});

			const renderShaderModule = device.createShaderModule({
				label: "Render shader module",
				code: await (await fetch("assets/shaders/render.wgsl")).text(),
			});

			const pipelineLayout = device.createPipelineLayout({
				label: "Pipeline layout",
				bindGroupLayouts: [this.#bindGroupLayout],
			});

			this.#computePipeline = device.createComputePipeline({
				label: "Compute pipeline",
				layout: pipelineLayout,
				compute: {
					module: computeShaderModule,
					entryPoint: "compute",
				},
			});

			this.#renderPipeline = device.createRenderPipeline({
				label: "Render pipeline",
				layout: pipelineLayout,
				vertex: {
					module: renderShaderModule,
					entryPoint: "vertex",
					buffers: [{
						arrayStride: 8,
						attributes: [{
							format: "float32x2",
							offset: 0,
							shaderLocation: 0,
						}],
					}],
				},
				fragment: {
					module: renderShaderModule,
					entryPoint: "fragment",
					targets: [{format}],
				},
			});
		}
	}

	lock() {
		this.#canvas.requestPointerLock();
	}

	/** @returns {Boolean} */
	isLocked() {
		return this.#canvas === document.pointerLockElement;
	}

	resize() {
		this.#canvas.width = this.#viewport[0];
		this.#canvas.height = this.#viewport[1];

		this.#device.queue.writeBuffer(this.#buffers.viewportUniform, 0, this.#viewport);
	}

	/** @param {Camera} camera */
	render(camera) {
		this.#device.queue.writeBuffer(this.#buffers.projectionInverseUniform, 0, camera.getProjectionInverse());
		this.#device.queue.writeBuffer(this.#buffers.viewInverseUniform, 0, camera.getViewInverse());
		this.#device.queue.writeBuffer(this.#buffers.cameraPositionUniform, 0, camera.getPosition());

		const time = performance.now();
		const encoder = this.#device.createCommandEncoder();
		const renderPass = encoder.beginRenderPass({
			colorAttachments: [{
				view: this.#context.getCurrentTexture().createView(),
				clearValue: [0, 0, 0, 1],
				loadOp: "clear",
				storeOp: "store",
			}],
		});

		renderPass.setPipeline(this.#renderPipeline);
		renderPass.setBindGroup(0, this.#bindGroup);
		renderPass.setVertexBuffer(0, this.#buffers.vertex);
		renderPass.draw(6);
		renderPass.end();

		this.#device.queue.submit([encoder.finish()]);

		window["debug-render-time"].textContent = `${(performance.now() - time).toFixed(3)}ms`;
	}
}