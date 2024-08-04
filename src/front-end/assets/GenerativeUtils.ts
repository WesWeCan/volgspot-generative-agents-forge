import axios from "axios";
import { ChromaClient } from "chromadb";

export class GenerativeUtils {

    // LLM API URL and model
    llmApiUrl = `http://localhost:1234/v1/chat/completions`;
    llmModel = "bartowski/gemma-2-27b-it-GGUF";

    // Embedding API URL and model
    embeddingApiUrl = `http://localhost:1234/v1/embeddings`;
    model = "vonjack/bge-m3-gguf";

    // Chroma API URL and embedder
    chromaUrl = "http://localhost:8009";
    chromaEmbedder = new LLMEmbeddingFunction(this.embeddingApiUrl, this.model);


    constructor() {

    }

    async testServices() {

        const completion = await this.complete("You are a test service, your sole purpose is to repeat what the user says", "System is working fine");
        const embed = await this.embed("I am a test service, I am working fine");

        if (completion && embed) {
            console.log("All LLM services are working fine");
        } else {
            console.log("There was an error with the LLM services");
        }

        console.log("Testing memory services");

        let memoryId = "test-memory";
        let memory = "This is a test memory";

        await this.createMemoryCollection(memoryId);
        await this.makeMemory(memoryId, memory);

        const query = "What is a test memory?";
        const results = await this.queryMemory(memoryId, query);

        if (results) {
            console.log("Memory services are working fine");
            await this.deleteMemoryCollection(memoryId);
        } else {
            console.log("There was an error with the memory services");
            await this.deleteMemoryCollection(memoryId);
        }

    }


    async complete(systemPrompt: string, userPrompt: string | string[]) {

        const chatApiUrl = this.llmApiUrl;
        const model = this.llmModel;

        let messages = [
            { "role": "system", "content": systemPrompt },
        ];

        if (typeof userPrompt === "string") {
            messages.push({ "role": "user", "content": userPrompt });
        } else {
            userPrompt.forEach((prompt) => {
                messages.push({ "role": "user", "content": prompt });
            });
        }

        const data = {
            model,
            messages,
            stream: false,
        };

        return axios.post(chatApiUrl, data)
            .then((response) => {
                // console.log(response);
                // console.log(response.data.choices[0].message.content);
                const responseMessage = response.data.choices[0].message.content.trim();
                return responseMessage;
            })
            .catch((error) => {
                console.log(error);
                throw error;
            });
    }

    async embed(input: string) {
        const embeddingApiUrl = this.embeddingApiUrl;
        const model = this.model;

        const data = {
            model,
            input,
        };

        return axios.post(embeddingApiUrl, data)
            .then((response) => {
                return response.data.data[0].embedding;
            })
            .catch((error) => {
                console.log(error);
                throw error;
            });

    }



    async recall(memoryId: string, query: string, num: number = 1) {

        const client = new ChromaClient({
            path: this.chromaUrl,
        });

        const collectionName = memoryId;

        let collection;
        try {
            collection = await client.getCollection({
                name: collectionName,
                embeddingFunction: this.chromaEmbedder,
            });
        } catch (error) {
            console.error('Collection not found', error);
            throw error;
        }

        const results = await collection.query({
            nResults: num,
            queryTexts: [query],
        });

        console.log("Query results", results);

        return results;
    }

    async memorize(memoryId: string, memory: string) {

        const client = new ChromaClient({
            path: this.chromaUrl,
        });

        const embedder = this.chromaEmbedder;
        const collectionName = memoryId;

        let collection;
        try {
            collection = await client.getCollection({
                name: collectionName,
                embeddingFunction: this.chromaEmbedder,
            });
        } catch (error) {
            console.error('Collection not found', error);
            throw error;
        }


        const formattedMemory = {
            ids: [this.generateUUID()],
            metadatas: [{ source: "user" }],
            documents: [memory]
        }

        await collection.add(formattedMemory);

    }

    async createMemoryCollection(memoryId: string) {

        console.log("Filling database");

        const client = new ChromaClient({
            path: this.chromaUrl,
        });

        const embedder = this.chromaEmbedder;
        const collectionName = memoryId;

        let collection;
        try {
            collection = await client.createCollection({
                name: collectionName,
                embeddingFunction: embedder,
            });
        } catch (error) {
            console.log('Collection creation failed, trying to get the existing collection...');
            throw error;
        }

    }

    async deleteMemoryCollection(memoryId: string) {
        const client = new ChromaClient({
            path: this.chromaUrl,
        });

        const embedder = this.chromaEmbedder;
        const collectionName = memoryId;

        let collection;

        try {

            collection = await client.getCollection({
                name: collectionName,
                embeddingFunction: embedder,
            });

            client.deleteCollection({ name: collectionName });

        } catch (error) {
            console.error('Failed to get the existing collection. Please check the collection name and embedding function.', error);
            throw error;
        }
    }




    generateUUID() { // Public Domain/MIT
        var d = new Date().getTime();//Timestamp
        var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if (d > 0) {//Use timestamp until depleted
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {//Use microseconds since page-load if supported
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

}



class LLMEmbeddingFunction {

    embeddingApiUrl: string;
    model: string;

    constructor(embeddingApiUrl: string, model: string) {

        this.embeddingApiUrl = embeddingApiUrl;
        this.model = model;

    }


    async generate(texts: string[]) {

        // console.log("texts:", texts);

        let embeddings = [];

        const embeddingApiUrl = this.embeddingApiUrl;
        const model = this.model;

        for (const text of texts) {
            const data = {
                model,
                input: text.replace(/[^a-zA-Z0-9 .,;:!?(){}\[\]"'`~@#%^&*_\-\/+=<>\\|]/g, ''),
            };

            try {
                const response = await axios.post(embeddingApiUrl, data);
                await new Promise(resolve => setTimeout(resolve, 100));

                // console.log(response.data.data[0].embedding);

                // @ts-ignore
                embeddings.push(response.data.data[0].embedding);
            } catch (error) {
                console.log(error.response.data.error);
                console.log();
            }
        }

        // console.log("embeddings:", embeddings);

        return embeddings;
    }
}