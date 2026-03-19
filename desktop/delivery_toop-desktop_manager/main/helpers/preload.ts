import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld(
    "log", {
        write: (channel: string, data: string) => {
            const validChannels = ["saveLog"];
            if(validChannels.includes(channel)){
                ipcRenderer.sendSync(channel, data);
            }
        }
    }
)