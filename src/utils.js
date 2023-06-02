/**
 * @param {GPUDevice} device
 * @param {HTMLCanvasElement} canvas
 * @returns {Object.<String, GPUBuffer>}
 */
export function createBuffers(device, canvas) {
	return {
		textureStorage: device.createTexture({
			size: {
				width: canvas.width,
				height: canvas.height,
			},
			format: "rgba8unorm",
			usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUBufferUsage.COPY_DST,
		}),
	};
}

/**
 * @param {GPUDevice} device
 * @param {String} path
 * @returns {GPUShaderModule}
 */
export async function createShaderModule(device, path) {
	const source = await (await fetch(path)).text();

	return device.createShaderModule({
		code: source,
	});
}

/**
 * @param {GPUDevice} device
 * @param {GPUShaderModule} computeShaderModule
 * @param {GPUTextureView} textureView
 * @returns {Array}
 */
export function createComputePipeline(device, computeShaderModule, textureView) {
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

	const computePipelineLayout = device.createPipelineLayout({
		bindGroupLayouts: [computeBindGroupLayout],
	});

	return [
		device.createBindGroup({
			layout: computeBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: textureView,
				},
			],
		}),
		device.createComputePipeline({
			layout: computePipelineLayout,
			compute: {
				module: computeShaderModule,
				entryPoint: "main",
			},
		}),
	];
}

/**
 * @param {GPUDevice} device
 * @param {GPUShaderModule} vertexShaderModule
 * @param {GPUShaderModule} fragmentShaderModule
 * @param {GPUSampler} sampler
 * @param {GPUTextureView} textureView
 * @param {String} format
 * @returns {Array}
 */
export function createRenderPipeline(device, vertexShaderModule, fragmentShaderModule, sampler, textureView, format) {
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

	const renderPipelineLayout = device.createPipelineLayout({
		bindGroupLayouts: [renderBindGroupLayout],
	});

	return [
		device.createBindGroup({
			layout: renderBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: sampler,
				}, {
					binding: 1,
					resource: textureView,
				},
			],
		}),
		device.createRenderPipeline({
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
		}),
	];
}