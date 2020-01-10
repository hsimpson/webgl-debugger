import { BrowserWindow, globalShortcut } from 'electron';
import { remote } from 'electron';

/*
function toggleDevTools(win: Electron.BrowserWindow): void {
  if (win) {
    win.webContents.toggleDevTools();
  }
}
*/

/*
export function registerDevToolsShortCut(win: Electron.BrowserWindow): void {
  globalShortcut.register('Control+Shift+I', () => {
    toggleDevTools(win);
  });
}
*/

export function registerDevToolsShortCutWeb(): void {
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    // const ctrlPressed = event.getModifierState('Control');
    //const shiftPressed = event.getModifierState('Shift');
    switch (event.key) {
      case 'F12':
        remote.getCurrentWindow().webContents.toggleDevTools();
        event.preventDefault();
        break;
      /*
        case 'i':
        if (ctrlPressed && shiftPressed) {
          remote.getCurrentWindow().webContents.toggleDevTools();
          event.preventDefault();
        }
        break;
      */
      default:
        break;
    }
  });
}
