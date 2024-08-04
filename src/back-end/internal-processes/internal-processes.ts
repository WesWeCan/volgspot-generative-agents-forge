
import { app, ipcMain } from 'electron';
import { shell } from 'electron';

export const registerInternalProcesses = async () => {

    ipcMain.on('openExternal', (event, arg) => {
        console.log('openExternal', arg);
        shell.openExternal(arg);
    });

    ipcMain.handle('getRandomNumber', async () => {
        console.log('getRandomNumber');
        // wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        const number = Math.floor(Math.random() * 100);
        return number;
    });

}