import './welcome.scss';
import React from 'react';
import { PanelTitle } from './panelTitle';

export class WelcomePanel extends React.Component {
  public render(): React.ReactNode {
    return (
      <div className="WelcomePanel">
        <PanelTitle title="Welcome"></PanelTitle>

        {/*}
        <div className="panelContainer">
          <div className={'WelcomePanelHeader'}>Header</div>
          <div className={'WelcomePanelContentContainer1'}>
            <div className={'WelcomePanelContentContainer2'}>
              <div className={'WelcomePanelContent'}>
                <p>Content 1</p>
                <p>Content 2</p>
                <p>Content 3</p>
                <p>Content 4</p>
                <p>Content 5</p>
                <p>Content 6</p>
                <p>Content 7</p>
                <p>Content 8</p>
              </div>
            </div>
          </div>
          <div className={'WelcomePanelFooter'}>Footer</div>
        </div>
        */}
      </div>
    );
  }
}
