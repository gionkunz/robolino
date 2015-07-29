uniform float time;
uniform float bump;
uniform sampler2D tNormal;
uniform sampler2D tMatCap;
uniform float noise;
uniform float useNormal;
uniform float useRim;
uniform float rimPower;
uniform float useScreen;
uniform float normalScale;
uniform float normalRepeat;

varying vec2 vUv;
varying vec3 vTangent;
varying vec3 vBinormal;
varying vec3 vNormal;
varying vec3 vEye;
varying vec3 vU;
varying vec2 vN;

//#ifdef USE_SHADOWMAP

	uniform sampler2D shadowMap[ MAX_SHADOWS ];
	uniform vec2 shadowMapSize[ MAX_SHADOWS ];

	uniform float shadowDarkness[ MAX_SHADOWS ];
	uniform float shadowBias[ MAX_SHADOWS ];

	varying vec4 vShadowCoord[ MAX_SHADOWS ];

	float unpackDepth( const in vec4 rgba_depth ) {

		const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
		float depth = dot( rgba_depth, bit_shift );
		return depth;

	}

//#endif

//#ifdef USE_FOG
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
//#endif

float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}

vec3 inputToLinear( in vec3 a ) {
#ifdef GAMMA_INPUT
	return pow( a, vec3( float( GAMMA_FACTOR ) ) );
#else
	return a;
#endif
}

void main() {

  vec3 finalNormal = vNormal;
  vec2 calculatedNormal = vN;

  if( useNormal == 1. ) {
    vec3 normalTex = texture2D( tNormal, vUv * normalRepeat ).xyz * 2.0 - 1.0;
    normalTex.xy *= normalScale;
    normalTex.y *= -1.;
    normalTex = normalize( normalTex );
    mat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), normalize( vNormal ) );
    finalNormal = tsb * normalTex;

    vec3 r = reflect( vU, normalize( finalNormal ) );
    float m = 2.0 * sqrt( r.x * r.x + r.y * r.y + ( r.z + 1.0 ) * ( r.z+1.0 ) );
    calculatedNormal = vec2( r.x / m + 0.5,  r.y / m + 0.5 );
  }

  vec3 base = texture2D( tMatCap, calculatedNormal ).rgb;

  // rim lighting

  if( useRim > 0. ) {
    float f = rimPower * abs( dot( vNormal, normalize( vEye ) ) );
    f = useRim * ( 1. - smoothstep( 0.0, 1., f ) );
        base += vec3( f );
    }

    // screen blending

      if( useScreen == 1. ) {
    base = vec3( 1. ) - ( vec3( 1. ) - base ) * ( vec3( 1. ) - base );
  }

      // noise

      base += noise * ( .5 - random( vec3( 1. ), length( gl_FragCoord ) ) );


//#ifdef USE_SHADOWMAP

	float fDepth;
	vec3 shadowColor = vec3( 1.0 );

	for( int i = 0; i < MAX_SHADOWS; i ++ ) {

		vec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;

				// if ( something && something ) breaks ATI OpenGL shader compiler
				// if ( all( something, something ) ) using this instead

		bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
		bool inFrustum = all( inFrustumVec );

				// don't shadow pixels outside of light frustum
				// use just first frustum (for cascades)
				// don't shadow pixels behind far plane of light frustum


			bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );

		bool frustumTest = all( frustumTestVec );

		if ( frustumTest ) {

			shadowCoord.z += shadowBias[ i ];

						// Percentage-close filtering
						// (9 pixel kernel)
						// http://fabiensanglard.net/shadowmappingPCF/

				float shadow = 0.0;

				float xPixelOffset = 1.0 / shadowMapSize[ i ].x;
				float yPixelOffset = 1.0 / shadowMapSize[ i ].y;

				float dx0 = -1.0 * xPixelOffset;
				float dy0 = -1.0 * yPixelOffset;
				float dx1 = 1.0 * xPixelOffset;
				float dy1 = 1.0 * yPixelOffset;

				mat3 shadowKernel;
				mat3 depthKernel;

				depthKernel[0][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );
				depthKernel[0][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );
				depthKernel[0][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );
				depthKernel[1][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );
				depthKernel[1][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );
				depthKernel[1][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );
				depthKernel[2][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );
				depthKernel[2][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );
				depthKernel[2][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );

				vec3 shadowZ = vec3( shadowCoord.z );
				shadowKernel[0] = vec3(lessThan(depthKernel[0], shadowZ ));
				shadowKernel[0] *= vec3(0.25);

				shadowKernel[1] = vec3(lessThan(depthKernel[1], shadowZ ));
				shadowKernel[1] *= vec3(0.25);

				shadowKernel[2] = vec3(lessThan(depthKernel[2], shadowZ ));
				shadowKernel[2] *= vec3(0.25);

				vec2 fractionalCoord = 1.0 - fract( shadowCoord.xy * shadowMapSize[i].xy );

				shadowKernel[0] = mix( shadowKernel[1], shadowKernel[0], fractionalCoord.x );
				shadowKernel[1] = mix( shadowKernel[2], shadowKernel[1], fractionalCoord.x );

				vec4 shadowValues;
				shadowValues.x = mix( shadowKernel[0][1], shadowKernel[0][0], fractionalCoord.y );
				shadowValues.y = mix( shadowKernel[0][2], shadowKernel[0][1], fractionalCoord.y );
				shadowValues.z = mix( shadowKernel[1][1], shadowKernel[1][0], fractionalCoord.y );
				shadowValues.w = mix( shadowKernel[1][2], shadowKernel[1][1], fractionalCoord.y );

				shadow = dot( shadowValues, vec4( 1.0 ) );

				shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );

		}
	}

	// NOTE: I am unsure if this is correct in linear space.  -bhouston, Dec 29, 2014
	shadowColor = inputToLinear( shadowColor );

	base = base * shadowColor;


		float depth = gl_FragCoord.z / gl_FragCoord.w;
		float fogFactor = smoothstep( fogNear, fogFar, depth );
	  base = mix( base, fogColor, fogFactor );

  gl_FragColor = vec4( base, 1. );

}
