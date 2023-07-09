struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) uv: vec2f,
}

const VERTICES: array<vec2f, 6> = array(
	vec2f(-1,  1),
	vec2f( 1,  1),
	vec2f(-1, -1),
	vec2f( 1,  1),
	vec2f( 1, -1),
	vec2f(-1, -1),
);

@vertex
fn main(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
	var output: VertexOutput;
	output.position = vec4f(VERTICES[vertex_index], 0, 1);
	output.uv = (output.position.xy + 1) * .5;

	return output;
}