export default class WebGL {
  /**
   * Compiles shader from source
   * @param {WebGLRenderingContext} gl
   * @param {string} source
   * @param {number} type
   */
  static compileShader (gl, source, type) {
    var shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    const shaderInfo = gl.getShaderInfoLog(shader)
    if (shaderInfo) console.log(shaderInfo)
    if (success) return shader

    gl.deleteShader(shader)
    throw Error('Shader failed to compile')
  }

  /**
   * Creates a program using 2 shaders
   * @param {WebGLRenderingContext} gl
   * @param {string} vsSource - vertex shader
   * @param {string} fsSource - fragment shader
   */
  static createShaderProgram (gl, vsSource, fsSource) {
    const program = gl.createProgram()
    const vShader = WebGL.compileShader(gl, vsSource, gl.VERTEX_SHADER)
    const fShader = WebGL.compileShader(gl, fsSource, gl.FRAGMENT_SHADER)
    gl.attachShader(program, vShader)
    gl.attachShader(program, fShader)
    gl.linkProgram(program)

    const success = gl.getProgramParameter(program, gl.LINK_STATUS)
    const programInfo = gl.getProgramInfoLog(program)
    if (programInfo) console.log(programInfo)
    if (success) return program

    gl.deleteProgram(program)
    throw Error('Program failed to link')
  }

  /**
   * Creates a program using 2 shaders
   * @param {WebGLRenderingContext} gl
   * @param {number} target - buffer target
   * @param {number} size
   * @param {number} usage
   */
  static createBuffer (gl, target, size, usage) {
    const buffer = gl.createBuffer()
    gl.bindBuffer(target, buffer)
    gl.bufferData(target, size, usage)
    return buffer
  }
}
