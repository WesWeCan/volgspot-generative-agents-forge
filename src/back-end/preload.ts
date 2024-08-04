// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { preloadSparkAPI } from './internal-processes/spark/SparkAPI';




declare global {
  interface Window {
    electronAPI: {
      openExternal: (url: string) => void;
      getRandomNumber: () => Promise<number>;
      onUpdateMenuCounter: (callback: (value: number) => void) => void;
      counterMenuValue: (value: number) => void;
    };
  }
}



contextBridge.exposeInMainWorld('electronAPI', {

    openExternal: (url: string) => { ipcRenderer.send('openExternal', url); },

    // NOTE: This is not a annonymous function, it is a function that returns a promise
    getRandomNumber: () => ipcRenderer.invoke('getRandomNumber') , 

    onUpdateMenuCounter: (callback : (value: number) => void) => {
        ipcRenderer.on('update-counter', (event, value) => {
            callback(value);
        });
      },

    counterMenuValue: (value : number) => {
        ipcRenderer.send('update-counter', value);
    }
    
});

preloadSparkAPI();