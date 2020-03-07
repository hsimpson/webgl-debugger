import { WGLObject, WebGLShaderWithTag, Constants } from './wglObject';
import { IWebGLFunc, GLSLangValidatorStage } from '../../../shared/IPC';

type ShaderType = Constants.VERTEX_SHADER | Constants.FRAGMENT_SHADER;
export class WGLShader extends WGLObject {
  private _source = '';
  private _type: ShaderType;
  private _programId: number;

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

  public get glslangValidatorStage(): GLSLangValidatorStage {
    switch (this._type) {
      case Constants.VERTEX_SHADER:
        return 'vert';
      case Constants.FRAGMENT_SHADER:
        return 'frag';
    }
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

  public get programId(): number {
    return this._programId;
  }

  public set programId(programId: number) {
    this._programId = programId;
  }
}
