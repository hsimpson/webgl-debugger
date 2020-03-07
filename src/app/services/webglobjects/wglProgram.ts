import { WGLObject, WebGLProgramWithTag, WebGLShaderWithTag } from './wglObject';
import { WGLShader } from './wglShader';
import { WebGLObjectsManagerSingleton } from './webglObjectsManager';

export class WGLProgram extends WGLObject {
  private _shaders: WGLShader[] = [];

  public attachShader(program: WebGLProgramWithTag, shader: WebGLShaderWithTag): void {
    //console.log(`program: ${program.tag.id}, shader:${shader.tag.id}`);
    const shaderObject = WebGLObjectsManagerSingleton.getById(shader.tag.id) as WGLShader;
    shaderObject.programId = this.id;
    this._shaders.push(shaderObject);
  }

  public getShaders(): WGLShader[] {
    return this._shaders;
  }

  public detachShader(/*program: WebGLProgramWithTag, shader: WebGLShaderWithTag*/): void {
    // do nothing here ;-)
    /*
      See page 31 of official OpenGL ES 2.0 spec:

      While a valid program object is in use, applications are free to modify attachedshader objects, compile attached shader objects, attach additional shader objects,and detach shader objects.  These operations do not affect the link status or exe-cutable code of the program object.
    */
    /*
    for (let i = 0; i < this._shaders.length; i++) {
      if (shader.tag.id === this._shaders[i].id) {
        this._shaders.splice(i, 1);
      }
    }
    */
  }
}
