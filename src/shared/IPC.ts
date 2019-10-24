export enum IPCChannel {
  WebGLFunc = 'WebGLFunc'
}

export interface IWebGLFunc {
  name: string;
  args: any[];
  returnValue: any;
  count: number;
}
