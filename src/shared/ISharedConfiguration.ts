import { BrowserWindow } from 'electron';

export interface ISharedConfiguration {
  traceWebGLFunctions: boolean;
  appWindowId: number;
  appBundlePath: string;
  webGLWindow: BrowserWindow | null;
}
