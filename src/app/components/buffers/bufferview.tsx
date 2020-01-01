import './bufferview.scss';
import React from 'react';
import { WGLBuffer } from '../../services/webglobjects/wglBuffer';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/MenuItem';
import { IBufferLayout, BufferLayouts } from './bufferlayouts';
import { BufferTable } from './buffertable';

export interface IBufferViewProp {
  buffer: WGLBuffer;
}

interface IBufferViewState {
  currentLayoutIdx: number;
  currentPrecision: number;
}

export class BufferView extends React.Component<IBufferViewProp, IBufferViewState> {
  private bufferLayouts: IBufferLayout[] = BufferLayouts;

  public readonly state: IBufferViewState = {
    currentLayoutIdx: 1, // vec3
    currentPrecision: 3,
  };

  private handleLayoutChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    const idx = event.target.value as number;
    this.setState({ currentLayoutIdx: idx });
  };

  private handlePrecisionChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    const idx = event.target.value as number;
    this.setState({ currentPrecision: idx });
  };

  public render(): React.ReactNode {
    if (this.props.buffer) {
      const testArray = [...Array(15).keys()];
      return (
        <div className="BufferView">
          <div>{`TypedArray: ${this.props.buffer.buffer.constructor.name}`}</div>
          <InputLabel id="bufferlayout-select-label">Buffer Layout</InputLabel>
          <Select
            labelId="bufferlayout-select-label"
            value={this.state.currentLayoutIdx}
            onChange={this.handleLayoutChange}>
            {this.bufferLayouts.map((bufferLayout: IBufferLayout, idx) => {
              return (
                <MenuItem key={idx} value={idx}>
                  {bufferLayout.id}
                </MenuItem>
              );
            })}
          </Select>
          <InputLabel id="precision-select-label">Precision</InputLabel>
          <Select
            labelId="precision-select-label"
            value={this.state.currentPrecision}
            onChange={this.handlePrecisionChange}>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={4}>4</MenuItem>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={6}>6</MenuItem>
          </Select>
          {/*
            <div className="BufferView-testcontainer">
              {testArray.map((idx) => {
                return (
                  <div className="BufferView-test" key={idx}>
                    BlaBlub #{idx}
                  </div>
                );
              })}
            </div>
          */}

          <BufferTable
            buffer={this.props.buffer}
            layout={this.bufferLayouts[this.state.currentLayoutIdx]}
            precision={this.state.currentPrecision}></BufferTable>
        </div>
      );
    } else {
      return <div className="BufferView">no buffer selected</div>;
    }
  }
}
