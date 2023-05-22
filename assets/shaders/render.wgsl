@binding(0) @group(0) var<uniform> viewport: vec2f;

struct VertexInput {
	@location(0) position: vec2f,
}

struct VertexOutput {
	@builtin(position) position: vec4f,
}

@vertex
fn vertex(input: VertexInput) -> VertexOutput {
	var output: VertexOutput;

	output.position = vec4f(input.position, 0, 1);

	return output;
}

@fragment
fn fragment(input: VertexOutput) -> @location(0) vec4f {
	let x: f32 = input.position.x / viewport.x;

	return vec4f(vec3f(x), 1);
}