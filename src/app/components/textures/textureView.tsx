import './textureView.scss';
import React from 'react';
import { WGLTexture } from '../../services/webglobjects/WGLTexture';
import ResizeObserver from 'resize-observer-polyfill';
import CanvasBackground from '../../../images/texture_background.png';

export interface ITextureViewProp {
  texture: WGLTexture;
}

interface ITextureViewState {
  canvasWidth: number;
  canvasHeight: number;
  zoomToFitFactor: number;
}

export class TextureView extends React.Component<ITextureViewProp, ITextureViewState> {
  public readonly state: ITextureViewState = {
    canvasWidth: 100,
    canvasHeight: 100,
    zoomToFitFactor: 0.5,
  };

  private _canvasRef = React.createRef<HTMLCanvasElement>();
  private _ro: ResizeObserver;
  private _ctx: CanvasRenderingContext2D;
  private _backGroundPattern: CanvasPattern;

  public componentDidMount(): void {
    this._ctx = this._canvasRef.current.getContext('2d');
    this._ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      if (entries.length) {
        const rect = entries[0].contentRect;
        this.setState({ canvasWidth: rect.width, canvasHeight: rect.height });
        this._calcFitToViewScale();
        this._draw();
      }
    });
    this._ro.observe(this._canvasRef.current);
  }

  public componentWillUnmount(): void {
    this._ro.disconnect();
    this._ro = null;
  }

  public componentDidUpdate(prevProps: ITextureViewProp): void {
    if (this.props.texture !== prevProps.texture) {
      this._calcFitToViewScale();
    }
    this._draw();
  }

  private async _draw(): Promise<void> {
    this._drawBackground();
    if (this.props.texture) {
      const imgData = new ImageData(this.props.texture.data, this.props.texture.width, this.props.texture.height);

      const image = await window.createImageBitmap(imgData);

      // get the top left position of the image
      const x = this._canvasRef.current.width / 2 - (this.props.texture.width / 2) * this.state.zoomToFitFactor;
      const y = this._canvasRef.current.height / 2 - (this.props.texture.height / 2) * this.state.zoomToFitFactor;
      this._ctx.drawImage(
        image,
        x,
        y,
        this.props.texture.width * this.state.zoomToFitFactor,
        this.props.texture.height * this.state.zoomToFitFactor
      );
      //this._ctx.putImageData(imgData, 0, 0, 0, 0, this.props.texture.width * 0.2, this.props.texture.height * 0.2);
    }
  }

  private _calcFitToViewScale(): void {
    let zoomToFitFactor = 1.0;
    if (this.props.texture) {
      zoomToFitFactor = Math.min(
        this._canvasRef.current.width / this.props.texture.width,
        this._canvasRef.current.height / this.props.texture.height
      );
    }
    this.setState({ zoomToFitFactor });
  }

  private _drawBackground(): void {
    if (this._backGroundPattern) {
      this._ctx.fillStyle = this._backGroundPattern;
      this._ctx.fillRect(0, 0, this._canvasRef.current.width, this._canvasRef.current.height);
    } else {
      const img = new Image();
      img.onload = () => {
        this._backGroundPattern = this._ctx.createPattern(img, 'repeat');
        this._ctx.fillStyle = this._backGroundPattern;
        this._ctx.fillRect(0, 0, this._canvasRef.current.width, this._canvasRef.current.height);
      };
      img.src = CanvasBackground;
    }
  }

  public render(): React.ReactNode {
    return (
      <div className="TextureView">
        <span>Texture view</span>
        <div className="TextureViewCanvasContainer">
          <canvas
            className="TextureViewCanvas"
            ref={this._canvasRef}
            width={this.state.canvasWidth}
            height={this.state.canvasHeight}></canvas>
        </div>
      </div>
    );
  }
}
