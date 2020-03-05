export enum IPCChannel {
  WebGLFunc = 'WebGLFunc',
  ValidateShaderRequest = 'ValidateShaderRequest',
  ValidateShaderResponse = 'ValidateShaderResponse',
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export interface IShaderValidationMessage {
  message: string;
  lineNumber: number;
  severity: 'WARNING' | 'ERROR';
}

export type GLSLangValidatorStage = 'vert' | 'frag' | 'comp';

export interface IShaderValidationCode {
  code: string;
  stage: GLSLangValidatorStage;
}

export enum glslValidatorFailCodes {
  ESuccess = 0,
  EFailUsage,
  EFailCompile,
  EFailLink,
  EFailCompilerCreate,
  EFailThreadCreate,
  EFailLinkerCreate,
}
