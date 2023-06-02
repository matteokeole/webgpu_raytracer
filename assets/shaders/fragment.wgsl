@binding(0) @group(0) var texture_sampler: sampler;
@binding(1) @group(0) var texture: texture_2d<f32>;

@fragment
fn main(@location(0) uv: vec2f) -> @location(0) vec4f {
	return textureSample(texture, texture_sampler, uv);
}