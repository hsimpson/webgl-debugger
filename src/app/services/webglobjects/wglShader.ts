import { WGLObject, WebGLShaderWithTag, Constants } from './wglObject';
import { IWebGLFunc } from '../../../shared/IPC';

type ShaderType = Constants.VERTEX_SHADER | Constants.FRAGMENT_SHADER;
export class WGLShader extends WGLObject {
  private _source = '';
  private _type: ShaderType;

  public constructor(func: IWebGLFunc) {
    super(func);
    this._type = func.args[0];
  }

  public shaderSource(shader: WebGLShaderWithTag, source: string): void {
    this._source = source;
  }

  public get type(): ShaderType {
    return this._type;
  }

  public get source(): string {
    return this._source;
  }

  public get typeString(): string {
    switch (this._type) {
      case Constants.VERTEX_SHADER:
        return 'vertex';
      case Constants.FRAGMENT_SHADER:
        return 'fragment';
      default:
        return 'unknown';
    }
  }
}
