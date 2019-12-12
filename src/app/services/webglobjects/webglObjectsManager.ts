import { WGLObject } from './wglObject';
import { WGLBuffer } from './wglBuffer';
import { WGLFramebuffer } from './wglFramebuffer';
import { WGLRenderbuffer } from './wglRenderbuffer';
import { WGLShader } from './wglShader';
import { WGLTexture } from './wglTexture';
import { WGLProgram } from './wglProgram';
import { IWebGLFunc } from '../../../shared/IPC';

export class WebGLObjectsManager {
  private static _instance: WebGLObjectsManager;
  private _objects: Map<number, WGLObject> = new Map<number, WGLObject>();

  private constructor() {} // eslint-disable-line @typescript-eslint/no-empty-function
  public static getInstance(): WebGLObjectsManager {
    if (!WebGLObjectsManager._instance) {
      WebGLObjectsManager._instance = new WebGLObjectsManager();
    }

    return WebGLObjectsManager._instance;
  }

  public clear(): void {
    this._objects.clear();
  }

  public create(func: IWebGLFunc): void {
    const id = func.tag.id;
    const type = func.name;
    // allready created, this should normally not happen ;-)
    if (this._objects.has(id)) {
      console.error(`create WebGLObject ${type} id: ${id} already exists`);
    }

    let newObj: WGLObject;

    switch (func.tag.name) {
      case 'WebGLBuffer':
        newObj = new WGLBuffer(func);
        break;
      case 'WebGLFramebuffer':
        newObj = new WGLFramebuffer(func);
        break;
      case 'WebGLProgram':
        newObj = new WGLProgram(func);
        break;
      case 'WebGLRenderbuffer':
        newObj = new WGLRenderbuffer(func);
        break;
      case 'WebGLShader':
        newObj = new WGLShader(func);
        break;
      case 'WebGLTexture':
        newObj = new WGLTexture(func);
        break;
      default:
        console.error(`create WebGLObject ${type} not implemented`);
        break;
    }

    if (newObj) {
      this._objects.set(id, newObj);
    }
  }

  public getById(id: number): WGLObject | undefined {
    return this._objects.get(id);
  }
}
