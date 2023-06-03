import {Camera} from "src";
import {Vector2} from "src/math";
import {createBuffers, createShaderModule, createComputePipeline, createRenderPipeline} from "./utils.js";

export function Renderer() {
	const canvas = document.createElement("canvas");
	let device, context, buffers;
	let textureView, textureSampler;
	let computeBindGroup, computePipeline;
	let renderBindGroup, renderPipeline;
	let time = 0;

	/** @type {?Camera} */
	this.camera = null;

	/** @returns {HTMLCanvasElement} */
	this.getCanvas = () => canvas;

	this.build = async function() {
		if (navigator.gpu == null) throw "WebGPU not supported.";

		const adapter = await navigator.gpu.requestAdapter();

		if (adapter == null) throw "Couldn't request WebGPU adapter.";

		device = await adapter.requestDevice();
		context = canvas.getContext("webgpu");
		const format = navigator.gpu.getPreferredCanvasFormat();

		context.configure({device, format});

		buffers = createBuffers(device, canvas);

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
		[computeBindGroup, computePipeline] = createComputePipeline(device, computeShaderModule, textureView, buffers);

		const vertexShaderModule = await createShaderModule(device, "assets/shaders/vertex.wgsl");
		const fragmentShaderModule = await createShaderModule(device, "assets/shaders/fragment.wgsl");
		[renderBindGroup, renderPipeline] = createRenderPipeline(device, vertexShaderModule, fragmentShaderModule, textureSampler, textureView, format);
	};

	this.render = function() {
		time = performance.now();

		const workgroupCount = new Vector2(canvas.clientWidth, canvas.clientHeight)

		device.queue.writeBuffer(buffers.camera, 0, Float32Array.of(...this.camera.position, 0, ...this.camera.direction));
		// device.queue.writeBuffer(buffers.camera, 0, this.camera.position, 3);
		// device.queue.writeBuffer(buffers.camera, 4, this.camera.direction, 3);

		const encoder = device.createCommandEncoder();

		const computePass = encoder.beginComputePass();
		computePass.setPipeline(computePipeline);
		computePass.setBindGroup(0, computeBindGroup);
		// TODO: Smaller workgroup count with larger workgroup size
		computePass.dispatchWorkgroups(workgroupCount[0], workgroupCount[1], 1);
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
};