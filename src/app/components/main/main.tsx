import React from 'react';

import { WelcomePanel } from '../panels/welcomePanel';
import { LaunchPanel } from '../panels/launchPanel';
import { SettingsPanel } from '../panels/settingsPanel';
import { HelpPanel } from '../panels/helpPanel';

import { StatusBar } from '../statusBar/statusBar';
import { VerticalMenu } from '../verticalMenu/verticalMenu';
import './main.scss';

interface IMainState {
  activePanel: string;
  panels: {
    [index: string]: React.ComponentClass;
  };
}

export class Main extends React.Component<{}, IMainState> {
  public readonly state: IMainState = {
    activePanel: 'welcome',
    panels: {
      welcome: WelcomePanel,
      launch: LaunchPanel,
      settings: SettingsPanel,
      help: HelpPanel,
    },
  };

  private handleMenuChanged = (name: string): void => {
    this.setState({ activePanel: name });
  };

  public render(): React.ReactNode {
    const SpecificPanel = this.state.panels[this.state.activePanel];
    return (
      <div className="Main">
        <div className="MainArea">
          <VerticalMenu onMenuChanged={this.handleMenuChanged}></VerticalMenu>
          <SpecificPanel></SpecificPanel>
        </div>
        <StatusBar></StatusBar>
      </div>
    );
  }
}
