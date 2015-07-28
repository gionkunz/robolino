export const shaders = new Map();

export default class ShaderFactory {
  static shader(key) {
    return shaders.get(key);
  }

  static loadShader(key, vertexShaderUrl, fragmentShaderUrl) {
    return Promise.all([fetch(vertexShaderUrl), fetch(fragmentShaderUrl)])
      .then((responses) => Promise.all([responses[0].text(), responses[1].text()]))
      .then((shaderScripts) => {
        const shader = {
          vertex: shaderScripts[0],
          fragment: shaderScripts[1]
        };
        shaders.set(key, shader);
        return shader;
      });
  }
}
