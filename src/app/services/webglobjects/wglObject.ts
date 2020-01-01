import { IWebGLTag, IWebGLFunc, WebGLObjectType } from '../../../shared/IPC';

export class WGLObject {
  private _id: number;
  private _name: WebGLObjectType;

  public constructor(func: IWebGLFunc) {
    this._id = func.tag.id;
    this._name = func.tag.name;
  }

  public get id(): number {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }
}

export interface WebGLBufferWithTag extends WebGLBuffer {
  tag: IWebGLTag;
}

export interface WebGLFramebufferWithTag extends WebGLFramebuffer {
  tag: IWebGLTag;
}

export interface WebGLProgramWithTag extends WebGLProgram {
  tag: IWebGLTag;
}

export interface WebGLRenderbufferWithTag extends WebGLRenderbuffer {
  tag: IWebGLTag;
}

export interface WebGLShaderWithTag extends WebGLShader {
  tag: IWebGLTag;
}

export interface WebGLTextureWithTag extends WebGLTexture {
  tag: IWebGLTag;
}

export const WGLCreateFunctions = [
  'createBuffer',
  'createFramebuffer',
  'createProgram',
  'createRenderbuffer',
  'createShader',
  'createTexture',
];

export const WGLProgramFunctions = [
  'attachShader',
  //'bindAttribLocation',
  //'deleteProgram',
  'detachShader',
];

export const WGLShaderFunctions = [
  //'compileShader',
  'deleteShader',
  //'getShaderParameter',
  //'getShaderInfoLog',
  //'getShaderSource',
  'shaderSource',
];

export const WGLBufferFunctions = ['bindBuffer', 'bufferData', 'buferSubData'];

export enum Constants {
  FRAGMENT_SHADER = 0x8b30,
  VERTEX_SHADER = 0x8b31,

  /* Buffer Objects */
  ARRAY_BUFFER = 0x8892,
  ELEMENT_ARRAY_BUFFER = 0x8893,
  ARRAY_BUFFER_BINDING = 0x8894,
  ELEMENT_ARRAY_BUFFER_BINDING = 0x8895,

  STREAM_DRAW = 0x88e0,
  STATIC_DRAW = 0x88e4,
  DYNAMIC_DRAW = 0x88e8,
}
