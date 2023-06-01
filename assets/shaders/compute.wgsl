@binding(0) @group(0) var<uniform> viewport: vec2u;
@binding(1) @group(0) var<storage, read_write> rendered_image: array<f32>;

const WORKGROUP_SIZE: vec2u = vec2u(8);

@compute
@workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
	let offset: vec2u = viewport / WORKGROUP_SIZE;
	let tile: vec2f = vec2f(offset);
	var x: f32;
	var i: u32;

	for (var y: f32; y < tile.y; y += 1) {
		for (x = 0; x < tile.x; x += 1) {
			i = (u32(x) + offset.x * id.x) + (u32(y) + offset.y * id.y) * viewport.x;

			rendered_image[i] = x / tile.x * y / tile.y;
		}
	}
}