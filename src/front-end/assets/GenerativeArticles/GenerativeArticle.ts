
import { GenerativeUtils } from "../GenerativeUtils";
import { prompts } from "./Prompts";

import axios from "axios";

import { ComfyClient } from "../ComfyClient";
import { ArticleData } from "../../types";

import moment from "moment";



export class GenerativeArticle {

    utils : GenerativeUtils;

    log : string[] = [];

    data : ArticleData;

    constructor() {
        this.utils = new GenerativeUtils();

        this.data = {
            articleId: "",
            title: "",
            content: "",
            image: false,
            imageUrl: "",
            publishDate: this.getPublishDate(),
        }
    }   



    $log(message: string) {
        console.info(message);
        this.log.push(message);
    }

    parseStringArray(str: string | string[], variables: { [key: string]: string }) {
        const replaceVariables = (input: string): string => {
            return input.replace(/\${([^}]+)}/g, (match, key) => {
                return variables[key] ?? match;
            });
        };

        if (Array.isArray(str)) {
            return str.map(s => replaceVariables(s));
        }

        return replaceVariables(str);
    }

    parseString(str: string, variables: { [key: string]: string }) {
        return str.replace(/\${([^}]+)}/g, (match, key) => {
            return variables[key];
        });
    }

    async loadData(data : ArticleData) {
        // console.log("Loading data: ", data);
        this.data.articleId = data.articleId;
        this.data.title = data.title;
        this.data.content = data.content;
        this.data.image = data.image;
        this.data.imageUrl = data.imageUrl;

        if(data.publishDate) {
            this.data.publishDate = data.publishDate;
        }
        else {
            this.data.publishDate = this.getPublishDate();
            this.saveData();
        }

    }


    getPublishDate = () => {

        let from = moment('2024-08-01');
        let to = moment('2025-03-15');
    
        let randomDate = from.add(Math.floor(Math.random() * (to.diff(from, 'days'))), 'days');
    
        // set random time
        randomDate.hour(Math.floor(Math.random() * 24));
        randomDate.minute(Math.floor(Math.random() * 60));
    
        // format for laravel carbon
        return randomDate.format('YYYY-MM-DD HH:mm:ss');
    }

    async generateData() {

        let topics = await this.generateTopics();
        
        console.log("Topic: ", topics);
    
    }


    async writeArticle(topic : string | string[]) {

        let extra = "";
        let title = "";

        if (Array.isArray(topic)) {
            title = topic[0];
            extra = "Dit is een beschrijving waar het artikel over gaat. De titel is: " + topic[0];
        }

        if (typeof topic === "string") {
            title = topic;
        }

        console.log("Writing article...");

        let article = await this.utils.complete(
            this.parseString(prompts.writeArticle.system, {
                title: title,
                extra: extra
            }),
            prompts.writeArticle.messages
        );


        this.data.articleId = this.utils.generateUUID();
        this.data.title = title;
        this.data.content = article;

        console.log("Article: ", article);

    }

    async saveData() {
        await window.sparkAPI.saveArticle(this.data);
    }




    async generateTopics(extraContext: string = "") {   

        console.log("Brainstorming topics...");

        const numTopics = 15;

        let rawTopics = await this.utils.complete(
            this.parseString(prompts.genTopic.system, {
                numTopics: numTopics.toString(),
                context: prompts.worldContext.system + extraContext
            }),
            this.parseStringArray(prompts.genTopic.system, {
                numTopics: numTopics.toString(),
            })
        );

        // extract the topics

        let topics = await this.utils.complete(
            this.parseString(prompts.extractList.system, {
                content: rawTopics
            }),
            prompts.extractList.messages   
        );

        let topicsJson = [];
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                topicsJson = JSON.parse(topics);
                console.log("Topics JSON: ", topicsJson);
                break;
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === 3) {
                    console.log("All attempts failed. Setting topicsJson to an empty array.");
                }
            }
        }


        return topicsJson as string[];

    }


    async generateImage() {

        console.log("Generating image...");

        let imagePrompt = await this.utils.complete(
            this.parseString(prompts.image.system, {
                title: this.data.title,
                content: ""
            }),
            prompts.image.messages
        );

        console.log("Image prompt: ", imagePrompt);

        const client = new ComfyClient(
            [
                { 
                path: ['3', 'inputs', 'seed'], 
                value: Math.floor(Math.random() * 10000) 
                },
                { 
                path: ['9', 'inputs', 'filename_prefix'], 
                value: "ArticleImage_"
                },
                {
                path: ["5", "inputs", "width"],
                value: 512*2
                },
                {
                path: ["5", "inputs", "height"],
                value: 512
                }
            ],
            (imageUrl) => {
                this.saveImage(imageUrl);
            });


            client.queuePrompt([
                { 
                path: ['6', 'inputs', 'text'], 
                value: imagePrompt
                }
            ]);


            return new Promise((resolve) => {
                resolve(true);
            });

    }


    async saveImage(imageUrl: string) {

        console.log("Saving image...", imageUrl);

        // upload the image to the server

        const memoryId = this.data.articleId;


        const data = {
            image: imageUrl,
            articleId: memoryId
        }

        await window.sparkAPI.saveArticleImage(data);

    }

        

}