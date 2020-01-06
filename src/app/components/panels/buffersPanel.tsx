import './buffersPanel.scss';
import React from 'react';
import './panelTitle';
import { PanelTitle } from './panelTitle';
import { Buffers } from '../buffers/buffers';

export class BuffersPanel extends React.Component {
  public render(): React.ReactNode {
    return (
      <div className="BuffersPanel">
        <PanelTitle title="Buffers"></PanelTitle>
        <div className="panelContainer">
          <Buffers></Buffers>
        </div>
      </div>
    );
  }
}
