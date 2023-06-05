@binding(0) @group(0) var<uniform> viewport: vec2f;

@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
	let x: f32 = position.x / viewport.x;

	return vec4f(vec3f(x), 1);
}