@binding(0) @group(0) var<uniform> viewport: vec2f;
@binding(1) @group(0) var<storage, read_write> rendered_image: array<f32>;

@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
	let uv: vec2f = position.xy;
	let index: u32 = u32(viewport.x * uv.y + uv.x);
	let color: f32 = rendered_image[index];

	return vec4f(vec3f(color), 1);
}