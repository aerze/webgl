#version 300 es
precision mediump float;

uniform sampler2D u_texture;
in vec2 v_textureCoord;

uniform vec4 u_color;
// in vec4 v_color;

out vec4 outColor;
void main() {
  outColor = texture(u_texture, v_textureCoord);
  // outColor = u_color; // return global color;
}
