import { WGLObject, WebGLProgramWithTag, WebGLShaderWithTag } from './wglObject';
import { WGLShader } from './wglShader';
import { WebGLObjectsManagerSingleton } from './webglObjectsManager';

export class WGLProgram extends WGLObject {
  private _shaders: WGLShader[] = [];

  public attachShader(program: WebGLProgramWithTag, shader: WebGLShaderWithTag): void {
    //console.log(`program: ${program.tag.id}, shader:${shader.tag.id}`);
    const shaderObject = WebGLObjectsManagerSingleton.getById(shader.tag.id) as WGLShader;
    this._shaders.push(shaderObject);
  }

  public getShaders(): WGLShader[] {
    return this._shaders;
  }
}
