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

export const WGLTextureFunctions = ['bindTexture', 'texImage2D'];

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

  /* Texture target */
  TEXTURE_2D = 0x0de1,
  TEXTURE_CUBE_MAP = 0x8513,
  TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515,
  TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516,
  TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517,
  TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518,
  TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519,
  TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851a,
  MAX_CUBE_MAP_TEXTURE_SIZE = 0x851c,

  /* DataType */
  BYTE = 0x1400,
  UNSIGNED_BYTE = 0x1401,
  SHORT = 0x1402,
  UNSIGNED_SHORT = 0x1403,
  INT = 0x1404,
  UNSIGNED_INT = 0x1405,
  FLOAT = 0x1406,

  /* PixelType */
  /*      UNSIGNED_BYTE */
  UNSIGNED_SHORT_4_4_4_4 = 0x8033,
  UNSIGNED_SHORT_5_5_5_1 = 0x8034,
  UNSIGNED_SHORT_5_6_5 = 0x8363,

  /* PixelFormat */
  DEPTH_COMPONENT = 0x1902,
  ALPHA = 0x1906,
  RGB = 0x1907,
  RGBA = 0x1908,
  LUMINANCE = 0x1909,
  LUMINANCE_ALPHA = 0x190a,
}
