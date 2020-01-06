import './verticalMenu.scss';
import { IVerticalMenuButtonProps, VerticalMenuButton } from './verticalMenuButton';
import React from 'react';

interface IVerticalMenuProps {
  onMenuChanged: (name: string) => void;
}

interface IVerticalMenuState {
  buttons: IVerticalMenuButtonProps[];
}

export class VerticalMenu extends React.Component<IVerticalMenuProps, IVerticalMenuState> {
  public readonly state: IVerticalMenuState = {
    buttons: [
      {
        name: 'launch',
        title: 'Launch WebGL site',
        faIcon: 'rocket',
      },
      {
        name: 'shaders',
        title: 'Programs and Shaders',
        faIcon: ['far', 'copy'], // use the prefix 'far' for the regular style icons
      },
      {
        name: 'buffers',
        title: 'Buffers',
        faIcon: ['fab', 'buffer'], // use the prefix 'fab' for brand style icons
      },
      {
        name: 'textures',
        title: 'Textures',
        faIcon: ['far', 'image'], // use the prefix 'far' for the regular style icons
      },
      {
        name: 'settings',
        title: 'Settings',
        faIcon: 'cogs',
      },
      {
        name: 'help',
        title: 'Help',
        faIcon: ['far', 'question-circle'], // use the prefix 'far' for the regular style icons
      },
    ],
  };

  private handleButtonClick = (button: IVerticalMenuButtonProps): void => {
    const buttons = this.state.buttons.map((btn) => {
      if (btn.name === button.name) {
        btn.active = true;
      } else {
        btn.active = false;
      }
      return btn;
    });
    this.setState({ buttons });
    this.props.onMenuChanged(button.name);
  };

  public render(): React.ReactNode {
    return (
      <div className="VerticalMenu">
        {this.state.buttons.map((button) => {
          return (
            <VerticalMenuButton
              key={button.name}
              name={button.name}
              title={button.title}
              faIcon={button.faIcon}
              active={button.active}
              onClick={this.handleButtonClick}
            />
          );
        })}
      </div>
    );
  }
}
