varying vec3 vVertexColor;

void main() {
  vVertexColor = color;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
