import './verticalMenuButton.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import React from 'react';

export interface IVerticalMenuButtonProps {
  name: string;
  faIcon: IconProp;
  active?: boolean;
  onClick?: (VerticalMenuButtonProps) => void;
}

type IVerticalMenuButtonState = IVerticalMenuButtonProps;

export class VerticalMenuButton extends React.Component<IVerticalMenuButtonProps, IVerticalMenuButtonState> {
  /*
  private getClassNames(): string {
    return  cla
  }
  */

  public render(): React.ReactNode {
    return (
      <div
        className={`VerticalMenuButton ${this.props.active ? 'active' : ''}`}
        onClick={() => this.props.onClick(this.props)}>
        <FontAwesomeIcon icon={this.props.faIcon} size="2x" className="fa-custom-style" />
      </div>
    );
  }
}
