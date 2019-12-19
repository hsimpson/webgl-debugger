import { WGLObject, WebGLProgramWithTag, WebGLShaderWithTag } from './wglObject';
import { WGLShader } from './wglShader';
import { WebGLObjectsManager } from './webglObjectsManager';

export class WGLProgram extends WGLObject {
  private _shaders: WGLShader[] = [];

  public attachShader(program: WebGLProgramWithTag, shader: WebGLShaderWithTag): void {
    //console.log(`program: ${program.tag.id}, shader:${shader.tag.id}`);
    const shaderObject = WebGLObjectsManager.getInstance().getById(shader.tag.id) as WGLShader;
    this._shaders.push(shaderObject);
  }

  public getShaders(): WGLShader[] {
    return this._shaders;
  }
}
