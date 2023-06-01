@binding(0) @group(0) var<uniform> viewport: vec2f;
@binding(1) @group(0) var<storage, read_write> rendered_image: array<f32>;

@compute
@workgroup_size(1, 1, 1)
fn main() {
	let v: vec2u = vec2u(viewport);
	let step: f32 = 1 / (viewport.x * viewport.y);
	var prev: f32;

	for (var y: u32; y < v.y; y++) {
		for (var x: u32; x < v.x; x++) {
			rendered_image[x + y * v.x] = prev + step;
			prev = rendered_image[x + y * v.x];
		}
	}
}