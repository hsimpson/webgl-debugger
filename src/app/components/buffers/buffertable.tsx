import React from 'react';
import { IBufferLayout } from './bufferlayouts';
import { WGLBuffer } from '../../services/webglobjects/wglBuffer';
import './buffertable.scss';

export interface IBufferTableProps {
  layout: IBufferLayout;
  buffer: WGLBuffer;
  precision: number;
}

export class BufferTable extends React.Component<IBufferTableProps> {
  private thead(): React.ReactNode {
    const colArray = [...Array(this.props.layout.elements).keys()];
    return (
      <thead>
        <tr>
          <th>Index</th>
          {colArray.map((idx) => {
            const colName: string = this.props.layout.names ? this.props.layout.names[idx] : `${idx}`;
            return (
              <th key={idx} className={colName}>
                {colName}
              </th>
            );
          })}
        </tr>
      </thead>
    );
  }

  private tbody(): React.ReactNode {
    const colArray = [...Array(this.props.layout.elements).keys()];
    const buffer = this.props.buffer.buffer;
    const rowCount = buffer.length / this.props.layout.elements;
    const rowCountArray = [...Array(rowCount).keys()];
    let cellIdx = 0;
    let precision = 0;
    const regex = /[f|F]loat/i;
    if (regex.test(buffer.constructor.name)) {
      precision = this.props.precision;
    }
    return (
      <tbody>
        {rowCountArray.map((rowIdx) => {
          return (
            <tr key={rowIdx}>
              <td>{rowIdx}</td>
              {colArray.map((colIdx) => {
                const num = buffer[cellIdx++] as number;
                return <td key={colIdx}>{num.toFixed(precision)}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    );
  }

  public render(): React.ReactNode {
    return (
      <div className="BufferTableContainer">
        <table className="BufferTable">
          {this.thead()}
          {this.tbody()}
        </table>
      </div>
    );
  }
}
