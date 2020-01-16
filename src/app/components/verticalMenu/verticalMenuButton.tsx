import './verticalMenuButton.scss';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import Tooltip from '@material-ui/core/Tooltip';

export interface IVerticalMenuButtonProps {
  name: string;
  title: string;
  faIcon: IconProp;
  active?: boolean;
  onClick?: (VerticalMenuButtonProps) => void;
}

type IVerticalMenuButtonState = IVerticalMenuButtonProps;

export class VerticalMenuButton extends React.Component<IVerticalMenuButtonProps, IVerticalMenuButtonState> {
  public render(): React.ReactNode {
    return (
      <Tooltip title={this.props.title}>
        <div
          className={`VerticalMenuButton ${this.props.active ? 'active' : ''}`}
          onClick={() => this.props.onClick(this.props)}>
          <FontAwesomeIcon icon={this.props.faIcon} size="2x" className="fa-custom-style" />
        </div>
      </Tooltip>
    );
  }
}
