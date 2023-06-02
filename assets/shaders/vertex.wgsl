const VERTICES: array<vec2f, 6> = array<vec2f, 6>(
	vec2f(-1, 1),
	vec2f(1, 1),
	vec2f(-1, -1),
	vec2f(1, 1),
	vec2f(1, -1),
	vec2f(-1, -1),
);

@vertex
fn main(@builtin(vertex_index) vertex_index: u32) -> @builtin(position) vec4f {
	return vec4f(VERTICES[vertex_index], 0, 1);
}