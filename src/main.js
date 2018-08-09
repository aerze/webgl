import vert from './vertex.glsl'
import frag from './fragment.glsl'
import Core from './core.js'

const canvas = document.createElement('canvas')
canvas.width = 400
canvas.height = 300

document.body.appendChild(canvas)

function main () {
  const image = new Image()
  image.src = '/images.png'
  image.onload = () => {
    const core = new Core(canvas)
    core.render(image)
  }
}

main()
