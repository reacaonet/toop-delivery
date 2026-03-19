import { app, ipcMain } from 'electron';
import { exec } from 'child_process';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import AL from 'auto-launch';
import fs from 'fs';
import path from 'path';

const isProd: boolean = process.env.NODE_ENV === 'production';
const arqLog: string = 'toopdelivery.log';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

if (isProd) {
  const autoLaunch = new AL({
    name: 'Toop Delivery',
  });

  autoLaunch.isEnabled().then(iD => {
    if (iD) {
      return;
    }

    autoLaunch.enable();
  });
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow('main', {
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('printFile', (event, args) => {
  fs.writeFileSync(args.file, args.object);

  const action = exec(args.action);
  action.on('close', () => {
    console.log('concluiu');
  });

  event.returnValue = 'Print finished';
});
