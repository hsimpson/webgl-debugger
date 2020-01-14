import './textureView.scss';
import React from 'react';
import { WGLTexture } from '../../services/webglobjects/wglTexture';
import ResizeObserver from 'resize-observer-polyfill';
import CanvasBackground from '../../../images/texture_background.png';
import { Constants } from '../../services/webglobjects/wglObject';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/MenuItem';

export interface ITextureViewProp {
  texture: WGLTexture;
}

interface ITextureViewState {
  canvasWidth: number;
  canvasHeight: number;
  zoomToFitFactor: number;
  zoomFactor: number;
  imageOffsetX: number;
  imageOffsetY: number;
  canvasCursorX: number;
  canvasCursorY: number;
  cursorR: number;
  cursorG: number;
  cursorB: number;
  cursorA: number;
  cursorColorFormat: number;
}

export class TextureView extends React.Component<ITextureViewProp, ITextureViewState> {
  public readonly state: ITextureViewState = {
    canvasWidth: 100,
    canvasHeight: 100,
    zoomToFitFactor: 1.0,
    zoomFactor: 1.0,
    imageOffsetX: 0,
    imageOffsetY: 0,
    canvasCursorX: 0,
    canvasCursorY: 0,
    cursorR: 0,
    cursorG: 0,
    cursorB: 0,
    cursorA: 1.0,
    cursorColorFormat: 0,
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

    this._canvasRef.current.addEventListener('mousemove', this._onCanvasMouseMove);
    this._canvasRef.current.addEventListener('wheel', this._onCanvasMouseWheel);
  }

  public componentWillUnmount(): void {
    this._ro.disconnect();
    this._ro = null;
  }

  public componentDidUpdate(prevProps: ITextureViewProp): void {
    if (this.props.texture !== prevProps.texture) {
      this._calcFitToViewScale();
      this._draw();
    }
  }

  private async _draw(): Promise<void> {
    await this._drawBackground();
    if (this.props.texture) {
      const imgData = new ImageData(this.props.texture.data, this.props.texture.width, this.props.texture.height);

      const image = await window.createImageBitmap(imgData);

      this._ctx.drawImage(
        image,
        this.state.imageOffsetX,
        this.state.imageOffsetY,
        this.props.texture.width * this.state.zoomToFitFactor * this.state.zoomFactor,
        this.props.texture.height * this.state.zoomToFitFactor * this.state.zoomFactor
      );
      //this._ctx.putImageData(imgData, 0, 0, 0, 0, this.props.texture.width * 0.2, this.props.texture.height * 0.2);
    }
  }

  private _calcFitToViewScale(): void {
    let zoomToFitFactor = 1.0;
    let imageOffsetX = 0;
    let imageOffsetY = 0;

    if (this.props.texture) {
      zoomToFitFactor = Math.min(
        this._canvasRef.current.width / this.props.texture.width,
        this._canvasRef.current.height / this.props.texture.height
      );

      // get the top left position of the image
      imageOffsetX =
        this._canvasRef.current.width / 2 - (this.props.texture.width / 2) * zoomToFitFactor * this.state.zoomFactor;
      imageOffsetY =
        this._canvasRef.current.height / 2 - (this.props.texture.height / 2) * zoomToFitFactor * this.state.zoomFactor;
    }
    this.setState({ zoomToFitFactor, imageOffsetX, imageOffsetY });
  }

  private async _drawBackground(): Promise<void> {
    return new Promise((resolve) => {
      if (this._backGroundPattern) {
        this._ctx.fillStyle = this._backGroundPattern;
        this._ctx.fillRect(0, 0, this._canvasRef.current.width, this._canvasRef.current.height);
        resolve();
      } else {
        const img = new Image();
        img.onload = () => {
          this._backGroundPattern = this._ctx.createPattern(img, 'repeat');
          this._ctx.fillStyle = this._backGroundPattern;
          this._ctx.fillRect(0, 0, this._canvasRef.current.width, this._canvasRef.current.height);
          resolve();
        };
        img.src = CanvasBackground;
      }
    });
  }

  private _onCanvasMouseMove = (event: MouseEvent): void => {
    let canvasCursorX = Math.round(
      (event.offsetX - this.state.imageOffsetX) / this.state.zoomToFitFactor / this.state.zoomFactor
    );
    let canvasCursorY = Math.round(
      (event.offsetY - this.state.imageOffsetY) / this.state.zoomToFitFactor / this.state.zoomFactor
    );

    if (this.props.texture) {
      canvasCursorX = Math.max(0, Math.min(canvasCursorX, this.props.texture.width - 1));
      canvasCursorY = Math.max(0, Math.min(canvasCursorY, this.props.texture.height - 1));
    }

    const isRGBA = this.props.texture.internalFormat === Constants.RGBA;

    // calc array offset
    let dataOffset = this.props.texture.width * canvasCursorY + canvasCursorX;
    if (isRGBA) {
      dataOffset *= 4;
    } else {
      dataOffset *= 3;
    }

    //console.log(dataOffset);

    const cursorR = this.props.texture.data[dataOffset];
    const cursorG = this.props.texture.data[++dataOffset];
    const cursorB = this.props.texture.data[++dataOffset];
    const cursorA = isRGBA ? this.props.texture.data[++dataOffset] : 1.0;

    this.setState({
      canvasCursorX,
      canvasCursorY,
      cursorR,
      cursorG,
      cursorB,
      cursorA,
    });
  };

  private _onCanvasMouseWheel = (event: WheelEvent): void => {
    let zoomFactor = this.state.zoomFactor;
    const fixZoom = 1.25;
    if (event.deltaY < 0) {
      zoomFactor *= fixZoom;
    } else {
      zoomFactor /= fixZoom;
    }

    this.setState({ zoomFactor });
    this._calcFitToViewScale();
    this._draw();

    //console.log(`zoomFactor: ${zoomFactor}`);
  };

  private _handleColorFormatChange = (event: React.ChangeEvent<{ value: number }>): void => {
    const cursorColorFormat = event.target.value;
    this.setState({ cursorColorFormat });
  };

  public render(): React.ReactNode {
    const cursorColorStyle = {
      backgroundColor: `rgba(${this.state.cursorR}, ${this.state.cursorG}, ${this.state.cursorB})`,
    };

    let displayR: number | string = this.state.cursorR;
    let displayB: number | string = this.state.cursorB;
    let displayG: number | string = this.state.cursorG;
    let displayA: number | string = this.state.cursorA;

    if (this.state.cursorColorFormat === 1) {
      displayR = (displayR / 255).toFixed(3);
      displayG = (displayG / 255).toFixed(3);
      displayB = (displayB / 255).toFixed(3);
      displayA = (displayA / 255).toFixed(3);
    } else if (this.state.cursorColorFormat === 2) {
      displayR = ((displayR / 255) * 100).toFixed(2) + ' %';
      displayG = ((displayG / 255) * 100).toFixed(2) + ' %';
      displayB = ((displayB / 255) * 100).toFixed(2) + ' %';
      displayA = ((displayA / 255) * 100).toFixed(2) + ' %';
    }

    return (
      <div className="TextureView">
        <div className="TextureViewInfoContainer">
          <span>{`Texture internal format: ${this.props.texture.internalFormatString}`}</span>
          <span>{`width: ${this.props.texture.width} px`}</span>
          <span>{`height: ${this.props.texture.height} px`}</span>
          <span>{`Cursor position: (${this.state.canvasCursorX},${this.state.canvasCursorY})`}</span>
          <span>{`R: ${displayR}`}</span>
          <span>{`G: ${displayG}`}</span>
          <span>{`B: ${displayB}`}</span>
          {this.props.texture.internalFormatString && <span>{`A: ${displayA}`}</span>}
          <InputLabel id="colorformat-select-label">RGB(A) format</InputLabel>
          <Select
            labelId="precision-select-label"
            value={this.state.cursorColorFormat}
            onChange={this._handleColorFormatChange}>
            <MenuItem value={0}>0 - 255</MenuItem>
            <MenuItem value={1}>0.0 - 1.0</MenuItem>
            <MenuItem value={2}>0% - 100%</MenuItem>
          </Select>
          <div className="TextureViewCursorColor" style={cursorColorStyle}></div>
        </div>
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
