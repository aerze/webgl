import Core from './core.js'

const { body } = window.document
body.style.margin = '0'
body.style.width = '100vw'
body.style.height = '100vh'

const canvas = document.createElement('canvas')
canvas.width = body.clientWidth
canvas.height = body.clientHeight

document.body.appendChild(canvas)

function main () {
  const image = new Image()
  image.onload = () => {
    new Core(canvas)
  }
  image.src = '/images.png'
}

main()
