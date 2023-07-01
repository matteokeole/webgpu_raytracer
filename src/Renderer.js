import {Camera, Scene} from "src";
import {Vector2} from "src/math";
import {createBuffers, createShaderModule, createComputePipeline, createRenderPipeline} from "./utils.js";

export function Renderer() {
	/** @type {?GPUDevice} */
	let device;

	/** @type {HTMLCanvasElement} */
	const canvas = document.createElement("canvas");

	/** @type {?GPUCanvasContext} */
	let context;

	/** @type {Object.<String, GPUBuffer>} */
	const buffers = {};

	/** @type {?GPUTextureView} */
	let textureView;

	/** @type {?GPUTextureSampler} */
	let textureSampler;

	/** @type {Object.<String, GPUBindGroup>} */
	const computeBindGroups = {};

	/** @type {Object.<String, GPUBindGroup>} */
	const renderBindGroups = {};

	/** @type {?GPUComputePipeline} */
	let computePipeline;

	/** @type {?GPURenderPipeline} */
	let renderPipeline;

	/** @type {?GPUCommandEncoder} */
	let commandEncoder;

	/** @type {Number} */
	let frameIndex = 1;

	/** @type {Number} */
	let computeTime = 0;

	/** @type {?Scene} */
	this.scene = null;

	/** @type {?Camera} */
	this.camera = null;

	/** @returns {HTMLCanvasElement} */
	this.getCanvas = () => canvas;

	this.build = async function() {
		if (navigator.gpu == null) throw "WebGPU is not supported.";

		const adapter = await navigator.gpu.requestAdapter();

		if (adapter == null) throw "Couldn't request WebGPU adapter.";

		device = await adapter.requestDevice();
		context = canvas.getContext("webgpu");
		const format = navigator.gpu.getPreferredCanvasFormat();

		context.configure({device, format});

		[buffers.textureStorage, buffers.accumulationStorage, buffers.camera, buffers.objects, buffers.materials, buffers.frameIndex, buffers.accumulate] = createBuffers(device, canvas, this.scene.objects.length, this.scene.materials.length);

		textureView = buffers.textureStorage.createView();
		textureSampler = device.createSampler({
			addressModeU: "repeat",
			addressModeV: "repeat",
			magFilter: "linear",
			minFilter: "nearest",
			mipmapFilter: "nearest",
			maxAnisotropy: 1,
		});

		const computeShaderModule = await createShaderModule(device, "assets/shaders/compute.wgsl");
		[computeBindGroups.texture, computeBindGroups.scene, computeBindGroups.flags, computePipeline] = createComputePipeline(device, computeShaderModule, buffers, textureView);

		const vertexShaderModule = await createShaderModule(device, "assets/shaders/vertex.wgsl");
		const fragmentShaderModule = await createShaderModule(device, "assets/shaders/fragment.wgsl");
		[renderBindGroups.texture, renderPipeline] = createRenderPipeline(device, vertexShaderModule, fragmentShaderModule, buffers, textureView, textureSampler, format);

		device.queue.writeBuffer(buffers.accumulationStorage, 0, new Float32Array(canvas.width * canvas.height * 4));

		new Float32Array(buffers.objects.getMappedRange()).set(this.scene.toObjectBuffer());
		buffers.objects.unmap();

		new Float32Array(buffers.materials.getMappedRange()).set(this.scene.toMaterialBuffer());
		buffers.materials.unmap();
	};

	/** @param {Boolean} accumulate */
	this.beginPasses = function(accumulate) {
		commandEncoder = device.createCommandEncoder();
		frameIndex = accumulate ? frameIndex + 1 : 1;
		computeTime = performance.now();

		device.queue.writeBuffer(buffers.camera, 0, this.camera.toBuffer());
		device.queue.writeBuffer(buffers.frameIndex, 0, Float32Array.of(frameIndex));
		device.queue.writeBuffer(buffers.accumulate, 0, Uint32Array.of(accumulate));
	};

	this.compute = function() {
		const workgroupCount = new Vector2(canvas.clientWidth, canvas.clientHeight).divideScalar(8);

		const computePass = commandEncoder.beginComputePass();
		computePass.setPipeline(computePipeline);
		computePass.setBindGroup(0, computeBindGroups.texture);
		computePass.setBindGroup(1, computeBindGroups.scene);
		computePass.setBindGroup(2, computeBindGroups.flags);
		computePass.dispatchWorkgroups(workgroupCount[0], workgroupCount[1], 1);
		computePass.end();
	};

	this.render = function() {
		const renderPass = commandEncoder.beginRenderPass({
			colorAttachments: [
				{
					view: context.getCurrentTexture().createView(),
					loadOp: "load",
					storeOp: "store",
				},
			],
		});
		renderPass.setPipeline(renderPipeline);
		renderPass.setBindGroup(0, renderBindGroups.texture);
		renderPass.draw(6);
		renderPass.end();
	};

	this.submitPasses = function() {
		device.queue.submit([commandEncoder.finish()]);

		window["debug-compute-time"].textContent = `${(performance.now() - computeTime).toFixed(3)}ms`;
	};
}

Renderer.prototype.lock = function() {
	this.getCanvas().requestPointerLock();
};

/** @returns {Boolean} */
Renderer.prototype.isLocked = function() {
	return this.getCanvas() === document.pointerLockElement;
};

/** @param {Vector2} viewort */
Renderer.prototype.resize = function(viewport) {
	const canvas = this.getCanvas();

	canvas.width = viewport[0];
	canvas.height = viewport[1];

	// TODO: Resize the texture
};