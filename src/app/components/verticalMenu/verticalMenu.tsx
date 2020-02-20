import './verticalMenu.scss';
import { IVerticalMenuButtonProps, VerticalMenuButton } from './verticalMenuButton';
import React from 'react';

// free solid
import { faCogs } from '@fortawesome/free-solid-svg-icons/faCogs';
import { faRocket } from '@fortawesome/free-solid-svg-icons/faRocket';

// free regular
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons/faQuestionCircle';
import { faImage } from '@fortawesome/free-regular-svg-icons/faImage';
import { faFileCode } from '@fortawesome/free-regular-svg-icons/faFileCode';

// free brands
import { faBuffer } from '@fortawesome/free-brands-svg-icons/faBuffer';

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
        faIcon: faRocket,
      },
      {
        name: 'shaders',
        title: 'Programs and Shaders',
        faIcon: faFileCode,
      },
      {
        name: 'buffers',
        title: 'Buffers',
        faIcon: faBuffer,
      },
      {
        name: 'textures',
        title: 'Textures',
        faIcon: faImage,
      },
      {
        name: 'settings',
        title: 'Settings',
        faIcon: faCogs,
      },
      {
        name: 'help',
        title: 'Help',
        faIcon: faQuestionCircle,
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
