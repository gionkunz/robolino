attribute vec4 tangent;

uniform float time;
uniform vec2 repeat;
uniform float useNormal;
uniform float useRim;

varying vec2 vUv;
varying vec3 vTangent;
varying vec3 vBinormal;
varying vec3 vNormal;
varying vec3 vEye;
varying vec3 vU;
varying vec2 vN;

// Shadow map THREE
#ifdef USE_SHADOWMAP

	varying vec4 vShadowCoord[ MAX_SHADOWS ];
	uniform mat4 shadowMatrix[ MAX_SHADOWS ];

#endif

void main() {

  vU = normalize( vec3( modelViewMatrix * vec4( position, 1.0 ) ) );
	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

  if( useNormal == 0. ) {
    vec3 n = normalize( normalMatrix * normal );
    vec3 r = reflect( vU, n );
    float m = 2.0 * sqrt( r.x * r.x + r.y * r.y + ( r.z + 1.0 ) * ( r.z+1.0 ) );
    vN = vec2( r.x / m + 0.5,  r.y / m + 0.5 );
  } else {
    vN = vec2( 0. );
  }

  vUv = repeat * uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

  vNormal = normalize( normalMatrix * normal );
  if( useNormal == 1. ) {
    vTangent = normalize( normalMatrix * tangent.xyz );
    vBinormal = normalize( cross( vNormal, vTangent ) * tangent.w );
  } else {
    vTangent = vec3( 0. );
    vBinormal = vec3( 0. );
  }

  if( useRim > 0. ) {
    vEye = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;
  } else {
    vEye = vec3( 0. );
  }

  #ifdef USE_SHADOWMAP

  	for( int i = 0; i < MAX_SHADOWS; i ++ ) {

  		vShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;

  	}

  #endif
}
