
/**
 * @memberof Katalyst
 */
class TinyCanvas {
  /**
   * Compiles shader from source
   * @param {WebGLRenderingContext} gl
   * @param {string} source
   * @param {number} type
   */
  static CompileShader (gl, source, type) {
    var shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return shader
  }

  /**
   * Creates a program using 2 shaders
   * @param {WebGLRenderingContext} gl
   * @param {string} vsSource - vertex shader
   * @param {string} fsSource - fragment shader
   */
  static CreateShaderProgram (gl, vsSource, fsSource) {
    const program = gl.createProgram()
    const vShader = TinyCanvas.CompileShader(gl, vsSource, gl.VERTEX_SHADER)
    const fShader = TinyCanvas.CompileShader(gl, fsSource, gl.FRAGMENT_SHADER)
    gl.attachShader(program, vShader)
    gl.attachShader(program, fShader)
    gl.linkProgram(program)
    return program
  }

  /**
   * Creates WebGLBuffer
   * @param {WebGLRenderingContext} gl
   * @param {number} bufferType
   * @param {number} size
   * @param {number} usage
   */
  static CreateBuffer (gl, bufferType, size, usage) {
    var buffer = gl.createBuffer()
    gl.bindBuffer(bufferType, buffer)
    gl.bufferData(bufferType, size, usage)
    return buffer
  }

  /**
   * Creates a texture render-able by TinyCanvas.img()
   * @param {WebGLRenderingContext} gl
   * @param {ImageBitmap | ImageData | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement} image
   * @param {number} width
   * @param {number} height
   */
  static CreateTexture (gl, image, width, height) {
    var texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texImage2D(gl.TEXTURE_2D, 0, RGBA, RGBA, UNSIGNED_BYTE, image)
    gl.bindTexture(gl.TEXTURE_2D, null)
    texture.width = width
    texture.height = height
    return texture
  }

  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor (canvas) {
  /** @type {WebGLRenderingContext} */
    const gl = canvas.getContext('webgl')
    const VERTEX_SIZE = (4 * 2) + (4 * 2) + (4)
    const MAX_BATCH = 10922 // floor((2 ^ 16) / 6)
    // const MAX_STACK = 100
    // const MAT_SIZE = 6
    const VERTICES_PER_QUAD = 6
    // const MAT_STACK_SIZE = MAX_STACK * MAT_SIZE
    const VERTEX_DATA_SIZE = VERTEX_SIZE * MAX_BATCH * 4
    const INDEX_DATA_SIZE = MAX_BATCH * (2 * VERTICES_PER_QUAD)
    const width = canvas.width
    const height = canvas.height
    const shader = TinyCanvas.CreateShaderProgram(gl, `
      precision lowp float;
      attribute vec2 a, b;
      attribute vec4 c;
      varying vec2 d;
      varying vec4 e;
      uniform mat4 m;
      uniform vec2 r;
      void main(){
        gl_Position=m*vec4(a,1.0,1.0);
        d=b;
        e=c;
      }`, `
      precision lowp float;
      varying vec2 d;
      varying vec4 e;
      uniform sampler2D f;
      void main(){
        gl_FragColor=texture2D(f,d)*e;
      }`)

    const glBufferSubData = gl.bufferSubData.bind(gl)
    const glDrawElements = gl.drawElements.bind(gl)
    const glBindTexture = gl.bindTexture.bind(gl)
    const glClear = gl.clear.bind(gl)
    const glClearColor = gl.clearColor.bind(gl)
    const vertexData = new ArrayBuffer(VERTEX_DATA_SIZE)
    const vPositionData = new Float32Array(vertexData)
    const vColorData = new Uint32Array(vertexData)
    let vIndexData = new Uint16Array(INDEX_DATA_SIZE)
    const IBO = TinyCanvas.CreateBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, vIndexData.byteLength, gl.STATIC_DRAW)
    const VBO = TinyCanvas.CreateBuffer(gl, gl.ARRAY_BUFFER, vertexData.byteLength, gl.DYNAMIC_DRAW)
    let count = 0
    const mat = new Float32Array([1, 0, 0, 1, 0, 0])
    const stack = new Float32Array(100)
    let stackp = 0
    const cos = Math.cos
    const sin = Math.sin
    let currentTexture = null
    let locA
    let locB
    let locC
    let indexA
    let indexB

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.enable(BLEND)
    gl.useProgram(shader)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IBO)
    for (indexA = indexB = 0; indexA < MAX_BATCH * VERTICES_PER_QUAD; indexA += VERTICES_PER_QUAD, indexB += 4) {
      vIndexData[indexA + 0] = indexB
      vIndexData[indexA + 1] = indexB + 1
      vIndexData[indexA + 2] = indexB + 2
      vIndexData[indexA + 3] = indexB + 0
      vIndexData[indexA + 4] = indexB + 3
      vIndexData[indexA + 5] = indexB + 1
    }

    glBufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, vIndexData)
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO)
    locA = gl.getAttribLocation(shader, 'a')
    locB = gl.getAttribLocation(shader, 'b')
    locC = gl.getAttribLocation(shader, 'c')
    gl.enableVertexAttribArray(locA)
    gl.vertexAttribPointer(locA, 2, gl.FLOAT, 0, VERTEX_SIZE, 0)
    gl.enableVertexAttribArray(locB)
    gl.vertexAttribPointer(locB, 2, gl.FLOAT, 0, VERTEX_SIZE, 8)
    gl.enableVertexAttribArray(locC)
    gl.vertexAttribPointer(locC, 4, gl.FLOAT, 1, VERTEX_SIZE, 16)
    gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'm'), 0,
      new Float32Array([
        2 / width, 0, 0, 0,
        0, -2 / height, 0, 0,
        0, 0, 1, 1, -1, 1, 0, 0
      ])
    )
    gl.activeTexture(gl.TEXTURE0)

    this.width = width
    this.height = height
    this.g = gl
    this.c = canvas
    this.col = 0xFFFFFFFF

    /**
     *  Sets the background color. Maps to glClearColor. It requires normalized to 1.0 values
     * @param {number} r - red
     * @param {number} g - green
     * @param {number} b - blue
     */
    this.bkg = function (r, g, b) {
      glClearColor(r, g, b, 1)
    }

    /**
     * Clear the current frame buffer
     */
    this.cls = function () {
      glClear(gl.COLOR_BUFFER_BIT)
    }

    /**
     * Applies translate transformation to current matrix
     * @param {number} x
     * @param {number} y
     */
    this.trans = function (x, y) {
      mat[4] = mat[0] * x + mat[2] * y + mat[4]
      mat[5] = mat[1] * x + mat[3] * y + mat[5]
    }

    /**
     * Applies scale transformation to current matrix
     * @param {number} x
     * @param {number} y
     */
    this.scale = function (x, y) {
      mat[0] = mat[0] * x
      mat[1] = mat[1] * x
      mat[2] = mat[2] * y
      mat[3] = mat[3] * y
    }

    /**
     * Applies rotation transformation to current matrix
     * @param {number} r - radians
     */
    this.rot = function (r) {
      const a = mat[0]
      const b = mat[1]
      const c = mat[2]
      const d = mat[3]
      const sr = sin(r)
      const cr = cos(r)

      mat[0] = a * cr + c * sr
      mat[1] = b * cr + d * sr
      mat[2] = a * -sr + c * cr
      mat[3] = b * -sr + d * cr
    }

    /**
     * Pushes the current matrix into the matrix stack
     */
    this.push = function () {
      stack[stackp + 0] = mat[0]
      stack[stackp + 1] = mat[1]
      stack[stackp + 2] = mat[2]
      stack[stackp + 3] = mat[3]
      stack[stackp + 4] = mat[4]
      stack[stackp + 5] = mat[5]
      stackp += 6
    }

    /**
     * Pops the matrix stack into the current matrix
     */
    this.pop = function () {
      stackp -= 6
      mat[0] = stack[stackp + 0]
      mat[1] = stack[stackp + 1]
      mat[2] = stack[stackp + 2]
      mat[3] = stack[stackp + 3]
      mat[4] = stack[stackp + 4]
      mat[5] = stack[stackp + 5]
    }

    /**
     * Batches texture rendering properties.
     * NOTE: If you are not drawing a tile of a texture then you can set u0 = 0, v0 = 0, u1 = 1 and v1 = 1
     * @param {WebGLTexture} texture
     * @param {number} x
     * @param {number} y
     * @param {number} w - width
     * @param {number} h - height
     * @param {number} u0
     * @param {number} v0
     * @param {number} u1
     * @param {number} v1
     */
    this.img = function (texture, x, y, w, h, u0, v0, u1, v1) {
      const x0 = x
      const y0 = y
      const x1 = x + w
      const y1 = y + h
      const x2 = x
      const y2 = y + h
      const x3 = x + w
      const y3 = y
      const a = mat[0]
      const b = mat[1]
      const c = mat[2]
      const d = mat[3]
      const e = mat[4]
      const f = mat[5]
      let offset = 0
      const argb = this.col

      if (texture !== currentTexture ||
        count + 1 >= MAX_BATCH) {
        glBufferSubData(gl.ARRAY_BUFFER, 0, vertexData)
        glDrawElements(4, count * VERTICES_PER_QUAD, gl.UNSIGNED_SHORT, 0)
        count = 0
        if (currentTexture !== texture) {
          currentTexture = texture
          glBindTexture(gl.TEXTURE_2D, currentTexture)
        }
      }

      offset = count * VERTEX_SIZE
      // Vertex Order
      // Vertex Position | UV | ARGB
      // Vertex 1
      vPositionData[offset++] = x0 * a + y0 * c + e
      vPositionData[offset++] = x0 * b + y0 * d + f
      vPositionData[offset++] = u0
      vPositionData[offset++] = v0
      vColorData[offset++] = argb

      // Vertex 2
      vPositionData[offset++] = x1 * a + y1 * c + e
      vPositionData[offset++] = x1 * b + y1 * d + f
      vPositionData[offset++] = u1
      vPositionData[offset++] = v1
      vColorData[offset++] = argb

      // Vertex 3
      vPositionData[offset++] = x2 * a + y2 * c + e
      vPositionData[offset++] = x2 * b + y2 * d + f
      vPositionData[offset++] = u0
      vPositionData[offset++] = v1
      vColorData[offset++] = argb

      // Vertex 4
      vPositionData[offset++] = x3 * a + y3 * c + e
      vPositionData[offset++] = x3 * b + y3 * d + f
      vPositionData[offset++] = u1
      vPositionData[offset++] = v0
      vColorData[offset++] = argb

      if (++count >= MAX_BATCH) {
        glBufferSubData(gl.ARRAY_BUFFER, 0, vertexData)
        glDrawElements(4, count * VERTICES_PER_QUAD, gl.UNSIGNED_SHORT, 0)
        count = 0
      }
    }

    /**
     * Pushes the current batch information to the GPU for rendering
     */
    this.flush = function () {
      if (count === 0) return
      glBufferSubData(gl.ARRAY_BUFFER, 0, vPositionData.subarray(0, count * VERTEX_SIZE))
      glDrawElements(4, count * VERTICES_PER_QUAD, gl.UNSIGNED_SHORT, 0)
      count = 0
    }
  }
}

export default TinyCanvas
