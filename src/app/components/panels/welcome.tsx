import './welcome.scss';
import React from 'react';
import { PanelTitle } from './panelTitle';

export class WelcomePanel extends React.Component {
  public render(): React.ReactNode {
    return (
      <div className="WelcomePanel">
        <PanelTitle title="Welcome"></PanelTitle>

        {/*
          <div className="panelContainer">
            <div className={'WelcomePanelHeader'}>Header</div>
            <div className={'WelcomePanelContent'}>
              <div>Content 1</div>
              <div>Content 2</div>
              <div>Content 3</div>
              <div>Content 4</div>
              <div>Content 5</div>
              <div>Content 6</div>
              <div>Content 7</div>
              <div>Content 8</div>
              <div>Content 9</div>
              <div>Content 10</div>
            </div>
            <div className={'WelcomePanelFooter'}>Footer</div>
          </div>
        */}
      </div>
    );
  }
}
