import './panelTitle.scss';
import React from 'react';

interface IPanelTitleProps {
  title: string;
}

export class PanelTitle extends React.Component<IPanelTitleProps> {
  public render(): React.ReactNode {
    return (
      <div className="PanelTitle">
        <span>{this.props.title}</span>
      </div>
    );
  }
}
