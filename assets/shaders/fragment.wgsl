@group(0) @binding(0) var texture: texture_2d<f32>;
@group(0) @binding(1) var texture_sampler: sampler;
@group(0) @binding(2) var<storage> accumulation: array<vec4f>;
@group(0) @binding(10) var<uniform> accumulate: u32;
@group(0) @binding(11) var<uniform> frame_index: f32;
@group(0) @binding(20) var<uniform> viewport: vec2u;

@fragment
fn main(@location(0) uv: vec2f) -> @location(0) vec4f {
	return textureSample(texture, texture_sampler, uv);
}