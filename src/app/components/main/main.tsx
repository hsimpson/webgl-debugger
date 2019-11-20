import './main.scss';
import React from 'react';
import { StatusBar } from '../statusBar/statusBar';
import { VerticalMenu } from '../verticalMenu/verticalMenu';

export class Main extends React.Component {
  private handleMenuChanged = (name: string): void => {
    console.log(name);
  };

  public render(): React.ReactNode {
    return (
      <div className="Main">
        <div className="MainArea">
          <VerticalMenu onMenuChanged={this.handleMenuChanged}></VerticalMenu>
        </div>
        <StatusBar></StatusBar>
      </div>
    );
  }
}
