import './helpPanel.scss';
import React from 'react';
import { PanelTitle } from './panelTitle';

export class HelpPanel extends React.Component {
  public render(): React.ReactNode {
    return (
      <div className="HelpPanel">
        <PanelTitle title="Help"></PanelTitle>
        <div className="panelContainer"></div>
      </div>
    );
  }
}
