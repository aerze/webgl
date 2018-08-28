#version 300 es
// [x, y]
in vec2 a_position;
// [r, g, b, a]
// in vec4 a_color;

in vec2 a_textureCoord;

// out vec4 v_color;
// [1, 2, 3, 4, 5, 6, 7, 8]
uniform mat3 u_matrix;

out vec2 v_textureCoord;

void main() {
  v_textureCoord = a_textureCoord;
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
  // v_color = a_color
}
