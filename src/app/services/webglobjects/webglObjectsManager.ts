import { WGLObject } from './wglObject';
import { WGLBuffer, BufferTarget } from './wglBuffer';
import { WGLFramebuffer } from './wglFramebuffer';
import { WGLRenderbuffer } from './wglRenderbuffer';
import { WGLShader } from './wglShader';
import { WGLTexture, TextureTarget } from './wglTexture';
import { WGLProgram } from './wglProgram';
import { IWebGLFunc, WebGLObjectType } from '../../../shared/IPC';

class WebGLObjectsManager {
  private _objects: Map<number, WGLObject> = new Map<number, WGLObject>();

  private _bufferBinding: {
    target: BufferTarget;
    bound: WGLBuffer;
  };

  private _textureBinding: {
    target: TextureTarget;
    bound: WGLTexture;
  };

  public constructor() {
    this._bufferBinding = { target: undefined, bound: undefined };
    this._textureBinding = { target: undefined, bound: undefined };
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
      case WebGLObjectType.WebGLBuffer:
        newObj = new WGLBuffer(func);
        break;
      case WebGLObjectType.WebGLFramebuffer:
        newObj = new WGLFramebuffer(func);
        break;
      case WebGLObjectType.WebGLProgram:
        newObj = new WGLProgram(func);
        break;
      case WebGLObjectType.WebGLRenderbuffer:
        newObj = new WGLRenderbuffer(func);
        break;
      case WebGLObjectType.WebGLShader:
        newObj = new WGLShader(func);
        break;
      case WebGLObjectType.WebGLTexture:
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

  public getByType(type: WebGLObjectType, sort = false): WGLObject[] {
    const ret: WGLObject[] = [];
    for (const v of this._objects.values()) {
      if (v.name === type) {
        ret.push(v);
      }
    }

    if (sort) {
      ret.sort((a, b) => {
        if (a.id < b.id) return -1;
        else return 1;
      });
    }

    return ret;
  }

  public bindBuffer(func: IWebGLFunc): void {
    const buffer = this._objects.get(func.args[1].tag.id) as WGLBuffer;

    this._bufferBinding.bound = buffer;
    this._bufferBinding.target = func.args[0];
  }

  public getBoundBuffer(): WGLBuffer {
    return this._bufferBinding.bound;
  }

  public bindTexture(func: IWebGLFunc): void {
    const texture = this._objects.get(func.args[1].tag.id) as WGLTexture;

    this._textureBinding.bound = texture;
    this._textureBinding.target = func.args[0];
  }

  public getBoundTexture(): WGLTexture {
    return this._textureBinding.bound;
  }
}

export const WebGLObjectsManagerSingleton = new WebGLObjectsManager();
