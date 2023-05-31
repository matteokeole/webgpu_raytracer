@binding(0) @group(0) var<uniform> viewport: vec2f;
@binding(1) @group(0) var<storage, read_write> rendered_image: array<f32>;

@compute
@workgroup_size(1)
fn main() {
	let step: f32 = 1 / viewport.x;
	var prev: f32 = 0;

	for (var i: i32 = 0; i < i32(viewport.x); i++) {
		if (prev > 1) {
			rendered_image[i] = 1;

			continue;
		}

		rendered_image[i] = prev + step;
		prev = rendered_image[i];
	}
}