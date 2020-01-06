import { WGLObject, Constants } from './wglObject';
import { IWebGLFunc } from '../../../shared/IPC';

export type TextureTarget =
  | Constants.TEXTURE_2D
  | Constants.TEXTURE_CUBE_MAP
  | Constants.TEXTURE_CUBE_MAP_POSITIVE_X
  | Constants.TEXTURE_CUBE_MAP_NEGATIVE_X
  | Constants.TEXTURE_CUBE_MAP_POSITIVE_Y
  | Constants.TEXTURE_CUBE_MAP_NEGATIVE_Y
  | Constants.TEXTURE_CUBE_MAP_POSITIVE_Z
  | Constants.TEXTURE_CUBE_MAP_NEGATIVE_Z;

export class WGLTexture extends WGLObject {
  private _target: TextureTarget;
  private _width: number;
  private _height: number;
  private _data: Uint8ClampedArray;

  public get data(): Uint8ClampedArray {
    return this._data;
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public texImage2D(func: IWebGLFunc): void {
    this._target = func.args[0];
    console.log(`WebGL call #${func.id}: ${func.name}`, func.args);
    if (func.args.length === 6) {
      console.log(`Byte length: ${func.args[5].data.length}`);
      this._data = new Uint8ClampedArray(func.args[5].data);
      this._width = func.args[5].width;
      this._height = func.args[5].height;
    }
  }
}
