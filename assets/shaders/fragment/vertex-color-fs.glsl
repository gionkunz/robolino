varying vec3 vVertexColor;

void main() {
  if(all(equal(vVertexColor, vec3(1, 1, 1)))) {
    gl_FragColor.rgb = vec3(0, 0, 0);
  } else {
    gl_FragColor.rgb = vVertexColor;
  }
}
