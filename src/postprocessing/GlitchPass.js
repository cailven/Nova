import { Pass } from './Pass.js';
import { GlitchShader } from './shader/GlitchShader.js';

class GlitchPass extends Pass {
  constructor(size = 64, goWild = false, effectComposer, renderToScreen = false) {
    super(effectComposer, renderToScreen);
    this.uniforms = THREE.UniformsUtils.clone(GlitchShader.uniforms);
    this.uniforms["tDisp"].value = this.generateHeightmap(size);

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: GlitchShader.vertexShader,
      fragmentShader: GlitchShader.fragmentShader
    });

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene();

    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);

    this.goWild = false;
    this.curF = 0;
    this.generateTrigger();
  }

  render(renderer, writeBuffer, readBuffer, delta, maskActive) {
    this.uniforms["tDiffuse"].value = readBuffer.texture;
    this.uniforms['seed'].value = Math.random();
    this.uniforms['byp'].value = 0;

    if (this.curF % this.randX == 0 || this.goWild == true) {
      this.uniforms['amount'].value = Math.random() / 30;
      this.uniforms['angle'].value = THREE.Math.randFloat(-Math.PI, Math.PI);
      this.uniforms['seed_x'].value = THREE.Math.randFloat(-1, 1);
      this.uniforms['seed_y'].value = THREE.Math.randFloat(-1, 1);
      this.uniforms['distortion_x'].value = THREE.Math.randFloat(0, 1);
      this.uniforms['distortion_y'].value = THREE.Math.randFloat(0, 1);
      this.curF = 0;
      this.generateTrigger();
    } else if (this.curF % this.randX < this.randX / 5) {
      this.uniforms['amount'].value = Math.random() / 90;
      this.uniforms['angle'].value = THREE.Math.randFloat(-Math.PI, Math.PI);
      this.uniforms['distortion_x'].value = THREE.Math.randFloat(0, 1);
      this.uniforms['distortion_y'].value = THREE.Math.randFloat(0, 1);
      this.uniforms['seed_x'].value = THREE.Math.randFloat(-0.3, 0.3);
      this.uniforms['seed_y'].value = THREE.Math.randFloat(-0.3, 0.3);
    } else if (this.goWild == false) {
      this.uniforms['byp'].value = 1;
    }

    this.curF++;
    this.quad.material = this.material;

    if (this.renderToScreen) {
      renderer.render(this.scene, this.camera);
    } else {
      renderer.render(this.scene, this.camera, writeBuffer, this.clear);
    }
  }

  generateTrigger() {
    this.randX = THREE.Math.randInt(120, 240);
  }

  generateHeightmap(size) {
    let dataArr = new Float32Array(size * size * 3);
    let length = size * size;

    for (let i = 0; i < length; i++) {
      let val = THREE.Math.randFloat(0, 1);
      dataArr[i * 3 + 0] = val;
      dataArr[i * 3 + 1] = val;
      dataArr[i * 3 + 2] = val;
    }

    let texture = new THREE.DataTexture(dataArr, size, size,
      THREE.RGBFormat, THREE.FloatType);
    texture.needsUpdate = true;
    return texture;
  }
}

export {
  GlitchPass
};