import './shadersPanel.scss';
import React from 'react';
import './panelTitle';
import { PanelTitle } from './panelTitle';
import { Programs } from '../shaders/programs';

export class ShadersPanel extends React.Component {
  public render(): React.ReactNode {
    return (
      <div className="ShadersPanel">
        <PanelTitle title="Programs and Shaders"></PanelTitle>
        <div className="panelContainer">
          <Programs></Programs>
        </div>
      </div>
    );
  }
}
