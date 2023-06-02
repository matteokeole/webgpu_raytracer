import {Vector2} from "src/math";

export class Renderer {
	/**
	 * @private
	 * @type {?HTMLCanvasElement}
	 */
	#canvas;

	constructor() {
		this.#canvas = document.createElement("canvas");
	}

	/** @returns {?HTMLCanvasElement} */
	getCanvas() {
		return this.#canvas;
	}

	async build() {
		if (navigator.gpu == null) throw "WebGPU not supported.";

		const adapter = await navigator.gpu.requestAdapter();

		if (adapter == null) throw "Couldn't request WebGPU adapter.";

		const device = await adapter.requestDevice();
		const context = this.#canvas.getContext("webgpu");
		const preferredCanvasFormat = navigator.gpu.getPreferredCanvasFormat();

		context.configure({
			device,
			format: preferredCanvasFormat,
		});

		const buffers = this.createBuffers(device);
		this.renderedImageView = buffers.renderedImageStorage.createView();
		this.sampler = device.createSampler({
			addressModeU: "repeat",
			addressModeV: "repeat",
			magFilter: "nearest", // "nearest" -> pixelated
			minFilter: "nearest",
			mipmapFilter: "nearest",
			maxAnisotropy: 1,
		});

		const computeShaderModule = await this.createShaderModule(device, "assets/shaders/compute.wgsl");
		this.createComputePipeline(device, computeShaderModule);

		const vertexShaderModule = await this.createShaderModule(device, "assets/shaders/vertex.wgsl");
		const fragmentShaderModule = await this.createShaderModule(device, "assets/shaders/fragment.wgsl");
		this.createRenderPipeline(device, vertexShaderModule, fragmentShaderModule, preferredCanvasFormat);

		this.device = device;
		this.context = context;
		this.buffers = buffers;
	}

	/**
	 * @param {GPUDevice} device
	 * @returns {Object.<String, GPUBuffer>}
	 */
	createBuffers(device) {
		return {
			renderedImageStorage: device.createTexture({
				size: {
					width: innerWidth,
					height: innerHeight,
				},
				format: "rgba8unorm",
				usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUBufferUsage.COPY_DST,
			}),
		};
	}

	/**
	 * @param {String} path
	 * @returns {GPUShaderModule}
	 */
	async createShaderModule(device, path) {
		const source = await (await fetch(path)).text();

		return device.createShaderModule({
			code: source,
		});
	}

	/**
	 * @param {GPUDevice} device
	 * @param {GPUShaderModule} computeShaderModule
	 */
	createComputePipeline(device, computeShaderModule) {
		const computeBindGroupLayout = device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.COMPUTE,
					storageTexture: {
						access: "write-only",
						format: "rgba8unorm",
						viewDimension: "2d",
					},
				},
			],
		});

		this.computeBindGroup = device.createBindGroup({
			layout: computeBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: this.renderedImageView,
				},
			],
		});

		const computePipelineLayout = device.createPipelineLayout({
			bindGroupLayouts: [computeBindGroupLayout],
		});

		this.computePipeline = device.createComputePipeline({
			layout: computePipelineLayout,
			compute: {
				module: computeShaderModule,
				entryPoint: "main",
			},
		});
	}

	/**
	 * @param {GPUDevice} device
	 * @param {GPUShaderModule} vertexShaderModule
	 * @param {GPUShaderModule} fragmentShaderModule
	 * @param {String} format
	 */
	createRenderPipeline(device, vertexShaderModule, fragmentShaderModule, format) {
		const renderBindGroupLayout = device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					sampler: {},
				}, {
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {},
				},
			],
		});

		this.renderBindGroup = device.createBindGroup({
			layout: renderBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: this.sampler,
				}, {
					binding: 1,
					resource: this.renderedImageView,
				},
			],
		});

		const renderPipelineLayout = device.createPipelineLayout({
			bindGroupLayouts: [renderBindGroupLayout],
		});

		this.renderPipeline = device.createRenderPipeline({
			layout: renderPipelineLayout,
			vertex: {
				module: vertexShaderModule,
				entryPoint: "main",
			},
			fragment: {
				module: fragmentShaderModule,
				entryPoint: "main",
				targets: [{format}],
			},
		});
	}

	lock() {
		this.#canvas.requestPointerLock();
	}

	/** @returns {Boolean} */
	isLocked() {
		return this.#canvas === document.pointerLockElement;
	}

	resize() {
		this.#canvas.width = this.viewport[0];
		this.#canvas.height = this.viewport[1];
	}

	render() {
		const time = performance.now();
		const computeBindGroup = this.computeBindGroup;
		const computePipeline = this.computePipeline;
		const renderBindGroup = this.renderBindGroup;
		const renderPipeline = this.renderPipeline;
		const device = this.device;
		const context = this.context;
		const encoder = device.createCommandEncoder();

		const computePass = encoder.beginComputePass();
		computePass.setPipeline(computePipeline);
		computePass.setBindGroup(0, computeBindGroup);
		computePass.dispatchWorkgroups(innerWidth * .125, innerHeight * .125, 1);
		computePass.end();

		const renderPass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: context.getCurrentTexture().createView(),
					clearValue: Float32Array.of(0, 0, 0, 1),
					loadOp: "clear",
					storeOp: "store",
				},
			],
		});
		renderPass.setPipeline(renderPipeline);
		renderPass.setBindGroup(0, renderBindGroup);
		renderPass.draw(6);
		renderPass.end();

		device.queue.submit([encoder.finish()]);

		window["debug-render-time"].textContent = `${(performance.now() - time).toFixed(3)}ms`;
	}
}