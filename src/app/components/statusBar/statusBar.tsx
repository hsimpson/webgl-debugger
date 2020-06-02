import './statusBar.scss';
import React from 'react';

interface IStatusItem {
  name: string;
  text: string;
}
interface IStatusBarState {
  items: IStatusItem[];
}

// eslint-disable-next-line @typescript-eslint/ban-types
export class StatusBar extends React.Component<{}, IStatusBarState> {
  public readonly state: IStatusBarState = {
    items: [
      {
        name: 'item1',
        text: 'Status item 1',
      },
      {
        name: 'item2',
        text: 'Status item 2',
      },
      {
        name: 'item3',
        text: 'Status item 3',
      },
    ],
  };

  public render(): React.ReactNode {
    return (
      <div className="StatusBar">
        {this.state.items.map((item) => {
          return (
            <div className="StatusBarItem" key={item.name}>
              {item.text}
            </div>
          );
        })}
      </div>
    );
  }
}
