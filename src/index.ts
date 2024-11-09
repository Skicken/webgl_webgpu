import "./styles/styles.scss"
import GUI from "lil-gui";

const gui = new GUI();
gui.add( document, 'title' );

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("webgl") as WebGLRenderingContext;

context.viewport(0, 0, canvas.width, canvas.height);
context.clearColor(0.0,0,0,1);


(function frame() {

  context.clear(context.COLOR_BUFFER_BIT);
  requestAnimationFrame(frame);

})();

