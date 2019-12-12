import React from 'react';

import { Themes } from '../../themes';

import { WelcomePanel } from '../panels/welcomePanel';
import { LaunchPanel } from '../panels/launchPanel';
import { SettingsPanel } from '../panels/settingsPanel';
import { HelpPanel } from '../panels/helpPanel';

import { StatusBar } from '../statusBar/statusBar';
import { VerticalMenu } from '../verticalMenu/verticalMenu';

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import './main.scss';

interface IMainProps {
  theme: 'dark' | 'light';
}

interface IMainState {
  activePanel: string;
  panels: {
    [index: string]: React.ComponentClass;
  };
}

export class Main extends React.Component<IMainProps, IMainState> {
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
      <ThemeProvider theme={createMuiTheme(Themes[this.props.theme])}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <div className="Main">
          <div className="MainArea">
            <VerticalMenu onMenuChanged={this.handleMenuChanged}></VerticalMenu>
            <SpecificPanel></SpecificPanel>
          </div>
          <StatusBar></StatusBar>
        </div>
      </ThemeProvider>
    );
  }
}
