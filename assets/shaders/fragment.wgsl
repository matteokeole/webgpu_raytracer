@binding(0) @group(0) var<uniform> viewport: vec2f;
@binding(1) @group(0) var<storage, read_write> rendered_image: array<f32>;

@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
	let uv: vec2u = vec2u(position.xy);
	let index: u32 = uv.x + uv.y * u32(viewport.x);
	let color: vec3f = vec3f(rendered_image[index]);

	return vec4f(color, 1);
}