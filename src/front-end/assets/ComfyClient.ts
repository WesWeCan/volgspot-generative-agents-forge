

// @ts-ignore
import defaultPrompt from './defaultPrompt.json';

// @ts-ignore
import workflow from './workflow_api.json';

interface ComfyPrompt {
    [key: string]: {
        class_type: string;
        inputs: { [key: string]: any };
    };
}

interface OutputImages {
    [key: string]: ArrayBuffer[];
}

interface ComfyPromptValue {
    path: (string | number)[],
    value: string | number
}


// Click the wheel in ComfyUI, enable dev options and save the api format!!
export class ComfyClient {

    serverUrl = "127.0.0.1:8188";
    clientId = "agent-client-" + Math.random().toString(36).substring(2, 15);

    ws: WebSocket;
    comfyPrompt: ComfyPrompt;

    callback: (imgUrl: string) => void;


    constructor(values: ComfyPromptValue[] | undefined = undefined, callback: (imageUrl: string) => void = () => { }) {
        console.log("ComfyClient constructor");

        this.comfyPrompt = workflow;

        if (values) {
            this.setValues(values);
        }

        this.callback = callback;

        this.ws = new WebSocket(`ws://${this.serverUrl}/ws?clientId=${this.clientId}`);

        this.ws.onopen = async () => {
            console.log("WebSocket opened");
            // this.ws.send(JSON.stringify(this.comfyPrompt));
        };

        this.ws.onclose = () => {
            console.log("WebSocket closed");
        };

        this.ws.onmessage = (event) => {
            // console.log("WebSocket message: ", event.data);
            this.handleMessage(event.data);
        };
    }

    async setValues(values: {
        path: (string | number)[],
        value: string | number
    }[]) {

        for (const value of values) {
            await this.setValue(value.value, value.path);
        }

    }


    async setValue(value: string | number, path: (string | number)[]) {
        let current: any = this.comfyPrompt;
        for (let i = 0; i < path.length - 1; i++) {
            if (current[path[i]] === undefined) {
                current[path[i]] = {} as { class_type: string; inputs: { [key: string]: any; } };
            }
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
    }



    async handleMessage(message: any) {
        if (typeof message === 'string') {
            message = JSON.parse(message);
        }

        switch (message.type) {
            case 'executing':
                console.log("Executing...", message.data);

                if (message.data.node == null) {

                    console.log("Execution done");
                    const outputImages = await this.getImages(message.data.prompt_id);

                    console.log("Output images: ", outputImages);

                    // gives an array of images as an arraybuffer
                    // convert to blob and display

                    for (const nodeId in outputImages) {
                        const imageData = outputImages[nodeId];
                        for (const image of imageData) {

                            console.log("Image data: ", image); // arrayBuffer

                            // Create a binary string from the ArrayBuffer
                            const binaryString = new Uint8Array(image).reduce((data, byte) => data + String.fromCharCode(byte), '');

                            // Encode the binary string to base64
                            const base64String = btoa(binaryString);

                            // Create the data URL
                            const imageUrl = `data:image/jpeg;base64,${base64String}`;

                            console.log(imageUrl);

                            this.callback(imageUrl);

                            // const imageElement = document.createElement("img");
                            // imageElement.src = imageUrl;
                            // imageElement.style.width = "100%";
                            // imageElement.style.height = "auto";
                            // document.body.appendChild(imageElement);
                        }
                    }
                }

                break;

            case 'execution_start':
                console.log("Execution started...", message.data);
                break;

            case 'excecuted':
                console.log("Execution of node ", message.data.node, " done");
                break;

            case 'status':
                console.log("Status: ", message.data);
                console.log("Queue Remaining", message.data.status.exec_info.queue_remaining);
                break;

            case 'execution_cached':
                console.log("Execution cached...", message.data);
                break;

            case 'progress':
                console.log("Progress: ", `${message.data.value / message.data.max * 100}%`);
                break;

            default:
                console.log("Unknown message type: ", message);
                break;
        }



    }

    async convertToImageUrl(arrayBuffer: ArrayBuffer) {
        const blob = new Blob([arrayBuffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        return url;
    }


    async queuePrompt(values: {
        path: (string | number)[],
        value: string | number
    }[]) {

        await this.setValues(values);

        const p = { prompt: this.comfyPrompt, client_id: this.clientId };
        const response = await fetch(`http://${this.serverUrl}/prompt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(p)
        })
            .catch((error) => {
                console.log("Error: ", error);
                throw error;
            });

        return await response.json();
    }

    async getImage(filename: string, subfolder: string, folderType: string) {
        const data = { filename, subfolder, type: folderType };
        const url = `http://${this.serverUrl}/view?${new URLSearchParams(data).toString()}`;
        const response = await fetch(url);
        return await response.arrayBuffer();
    }

    async getHistory(promptId: string) {
        const response = await fetch(`http://${this.serverUrl}/history/${promptId}`);
        return await response.json();
    }

    async getImages(promptId: string) {

        const outputImages: OutputImages = {};

        const history = (await this.getHistory(promptId))[promptId];
        for (const nodeId in history['outputs']) {
            const nodeOutput = history['outputs'][nodeId];
            if ('images' in nodeOutput) {
                const imagesOutput = [];
                for (const image of nodeOutput['images']) {
                    const imageData = await this.getImage(image['filename'], image['subfolder'], image['type']);
                    imagesOutput.push(imageData);
                }
                outputImages[nodeId] = imagesOutput;
            }
        }

        return outputImages;
    }

}

