export default class Matrix {
  /**
   * Create a new Matrix from the canvas projection
   * @param {number} width canvas width
   * @param {number} height canvas height
   */
  static fromProjection (width, height) {
    return new Matrix().project(width, height)
  }

  /**
   * @param {number} width
   * @param {number} height
   * @param {number} tx
   * @param {number} ty
   * @param {number} angle
   * @param {number} sx
   * @param {number} sy
   */
  static fromTransformation (width, height, tx, ty, angle, sx, sy) {
    return new Matrix()
      .project(width, height)
      .translate(tx, ty)
      .rotation(angle)
      .scale(sx, sy)
  }

  constructor (contents = [1, 0, 0, 0, 1, 0, 0, 0, 1]) {
    this.contents = contents
  }

  /**
   * @param {Matrix | Array<number>} matrix
   */
  multiply (matrix) {
    const a = this.contents
    const b = matrix.contents || matrix
    this.contents = [
      b[0] * a[0] + b[1] * a[3] + b[2] * a[6],
      b[0] * a[1] + b[1] * a[4] + b[2] * a[7],
      b[0] * a[2] + b[1] * a[5] + b[2] * a[8],
      b[3] * a[0] + b[4] * a[3] + b[5] * a[6],
      b[3] * a[1] + b[4] * a[4] + b[5] * a[7],
      b[3] * a[2] + b[4] * a[5] + b[5] * a[8],
      b[6] * a[0] + b[7] * a[3] + b[8] * a[6],
      b[6] * a[1] + b[7] * a[4] + b[8] * a[7],
      b[6] * a[2] + b[7] * a[5] + b[8] * a[8]
    ]
    return this
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  translate (x, y) {
    return this.multiply([1, 0, 0, 0, 1, 0, x, y, 1])
  }

  /**
   * @param {number} radians
   */
  rotation (radians) {
    const c = Math.cos(radians)
    const s = Math.sin(radians)
    return this.multiply([c, -s, 0, s, c, 0, 0, 0, 1])
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  scale (x, y) {
    return this.multiply([x, 0, 0, 0, y, 0, 0, 0, 1])
  }

  /**
   * @param {number} width
   * @param {number} height
   */
  project (width, height) {
    const w = 2 / width
    const h = -2 / height
    return this.multiply([w, 0, 0, 0, h, 0, -1, 1, 1])
  }

  transform (width, height, tx, ty, angle, sx, sy) {
    return this.project(width, height)
      .translate(tx, ty)
      .rotation(angle)
      .scale(sx, sy)
  }
}
