@group(0) @binding(0) var texture: texture_2d<f32>;
@group(0) @binding(1) var texture_sampler: sampler;
@group(0) @binding(2) var<storage> accumulation: array<vec4f>;
@group(0) @binding(13) var<uniform> frameIndex: f32;
@group(0) @binding(14) var<uniform> accumulate: u32;
@group(0) @binding(20) var<uniform> viewport: vec2u;

@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
	let uv: vec2u = vec2u(u32(position.x), u32(position.y));
	let index: u32 = uv.x + uv.y * viewport.x;
	let sample: vec4f = accumulation[index];

	if (accumulate == 0) {
		// return textureSample(texture, texture_sampler, uv);
		return sample;
	}

	return sample / frameIndex;
}