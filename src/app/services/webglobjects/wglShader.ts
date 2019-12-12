import { WGLObject, WebGLShaderWithTag, Constants } from './wglObject';
import { IWebGLFunc } from '../../../shared/IPC';

export class WGLShader extends WGLObject {
  private source = '';
  private type: Constants.VERTEX_SHADER | Constants.FRAGMENT_SHADER;

  public constructor(func: IWebGLFunc) {
    super(func);
    this.type = func.args[0];
  }

  public shaderSource(shader: WebGLShaderWithTag, source: string): void {
    this.source = source;
  }
}
