export enum IPCChannel {
  WebGLFunc = 'WebGLFunc',
}

export enum WebGLObjectType {
  WebGLBuffer = 'WebGLBuffer',
  WebGLFramebuffer = 'WebGLFramebuffer',
  WebGLProgram = 'WebGLProgram',
  WebGLRenderbuffer = 'WebGLRenderbuffer',
  WebGLShader = 'WebGLShader',
  WebGLTexture = 'WebGLTexture',
}

export interface IWebGLTag {
  name: WebGLObjectType;
  id: number;
}

export interface IWebGLFunc {
  name: string;
  args: any[];
  returnValue?: any;
  id: number;
  tag?: IWebGLTag;
  bufferType?: string;
}

export const OpaqueWebGLObjects = [
  'WebGLBuffer',
  'WebGLFramebuffer',
  'WebGLProgram',
  'WebGLRenderbuffer',
  'WebGLShader',
  'WebGLTexture',
  'WebGLUniformLocation',
];
