export enum IPCChannel {
  WebGLFunc = 'WebGLFunc',
}

export interface IWebGLTag {
  name: string;
  id: number;
}

export interface IWebGLFunc {
  name: string;
  args: any[];
  returnValue: any;
  count: number;
  tag?: IWebGLTag;
}
