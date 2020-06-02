import React from 'react';
import './buffers.scss';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { WGLBuffer } from '../../services/webglobjects/wglBuffer';
import { WebGLObjectsManagerSingleton } from '../../services/webglobjects/webglObjectsManager';
import { WebGLObjectType } from '../../../shared/IPC';
import { BufferView } from './bufferview';
import Divider from '@material-ui/core/Divider';

interface IBuffersState {
  selectedBuffer: WGLBuffer;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export class Buffers extends React.Component<{}, IBuffersState> {
  public readonly state: IBuffersState = {
    selectedBuffer: undefined,
  };

  private _handleBufferClick = (selectedBuffer: WGLBuffer): void => {
    this.setState({ selectedBuffer });
  };

  public render(): React.ReactNode {
    const buffers: WGLBuffer[] = WebGLObjectsManagerSingleton.getByType(
      WebGLObjectType.WebGLBuffer,
      true
    ) as WGLBuffer[];

    return (
      <div className="Buffers">
        <List className="BuffersList" component="nav">
          {buffers.map((buffer: WGLBuffer) => {
            return (
              <ListItem
                key={buffer.id}
                button
                selected={this.state.selectedBuffer?.id === buffer.id}
                onClick={() => this._handleBufferClick(buffer)}>
                <ListItemText primary={`Buffer #${buffer.id}`} />
              </ListItem>
            );
          })}
        </List>
        <Divider></Divider>
        <BufferView buffer={this.state.selectedBuffer}></BufferView>
      </div>
    );
  }
}
