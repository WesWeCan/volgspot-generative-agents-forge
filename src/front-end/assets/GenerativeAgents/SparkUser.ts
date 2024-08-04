import axios from "axios";
import { GenerativeUtils } from "../GenerativeUtils";

import { prompts } from "./Prompts";
import { traits } from "./Traits";

import { ComfyClient } from "../ComfyClient";

export interface SparkUserData {
    memoryId: string,
    name: string,
    userName: string,
    traits: string[],
    description: string,
    bio: string,
    initialMemories: string[],
    profilePicture?: boolean,
}

export class SparkUser {

    utils : GenerativeUtils;

    

    data : SparkUserData
    = {
        memoryId : "",
        name: "",
        userName: "",
        traits: [],
        bio: "",
        description: "",
        initialMemories: [],
        profilePicture: false,
    };

    log : string[] = [];

    constructor(data : SparkUserData | undefined = undefined) {
        this.utils = new GenerativeUtils();        

        if (data) {
            this.loadData(data);
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

    async generateData() {
        const data = await new CharacterGenerator().generateData(this.data);
        
        this.loadData(data);
    }

    async loadData(data : SparkUserData) {
        // console.log("Loading data: ", data);
        this.data = data;
    }

    async saveData() {

        await window.sparkAPI.saveAgentData(this.data);
    }

    async writePost(topic: string) {

        console.log("Writing post...");

        let post = await this.utils.complete(
            this.parseString(prompts.postWriting.writePost.system, {
                name: this.data.name,
                traits: this.data.traits.join(","),
                topic: topic,
                memories: this.data.initialMemories.join(",")
            }),
            this.parseStringArray(prompts.postWriting.writePost.messages, {
                userName: this.data.userName
            })
        );

        console.log("Post: ", post);

        return post;
    }

    async react(context: string, content: string) {

        console.log("Reacting...");

        let reaction = await this.utils.complete(
            this.parseString(prompts.postWriting.react.system, {
                name: this.data.name,
                traits: this.data.traits.join(","),
                content: content,
                context: context,
                memories: this.data.initialMemories.join(",")
            }),
            this.parseStringArray(prompts.postWriting.react.messages, {
                userName: this.data.userName
            })
        );

        console.log("Reaction: ", reaction);

        return reaction;
    }

    async brainstormTopics() {
        console.log("Brainstorming topics...");

        let rawTopics = await this.utils.complete(
            this.parseString(prompts.postWriting.brainstormTopics.system, {
                name: this.data.name,
                traits: this.data.traits.join(","),
                memories: this.data.initialMemories.join(",")
            }),
            this.parseStringArray(prompts.postWriting.brainstormTopics.messages, {
                userName: this.data.userName
            })
        );

        // extract the topics

        let topics = await this.utils.complete(
            this.parseString(prompts.genCharacter.extractList.system, {
                content: rawTopics
            }),
            prompts.genCharacter.extractList.messages   
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

        console.log("Topics JSON: ", topicsJson);

        return topicsJson;
    }


    async generateProfilePicture() {
        console.log("Generating profile picture...");
       

        
            let profilePicturePrompt = await this.utils.complete(
                this.parseString(prompts.genCharacter.profilePicture.system, {
                    name: this.data.name,
                    traits: this.data.traits.join(","),
                    description: this.data.description
                }),
                prompts.genCharacter.profilePicture.messages
            );


    
        console.log("Prompt: ", profilePicturePrompt);

        const client = new ComfyClient(
            [
                { 
                path: ['3', 'inputs', 'seed'], 
                value: Math.floor(Math.random() * 10000) 
                },
                { 
                path: ['9', 'inputs', 'filename_prefix'], 
                value: "AgentProfilePicture_"
                },
                {
                path: ["5", "inputs", "width"],
                value: 512
                },
                {
                path: ["5", "inputs", "height"],
                value: 512
                }
            ],
            (imageUrl) => {
                this.saveProfilePicture(imageUrl);
            });


            client.queuePrompt([
                { 
                path: ['6', 'inputs', 'text'], 
                value: profilePicturePrompt
                }
            ]);


            return new Promise((resolve) => {
                resolve(true);
            });
        
    }


    async saveProfilePicture(imageUrl: string) {

        console.log("Saving profile picture...", imageUrl);

        // upload the image to the server

        const memoryId = this.data.memoryId;

        const data = {
            image: imageUrl,
            memoryId: memoryId
        }

        await window.sparkAPI.saveProfilePicture(data);


    }

        


}









class CharacterGenerator {

    utils : GenerativeUtils;

    data : SparkUserData
    = {
        memoryId : "xxx",
        name: "[unknown]",
        userName: "@[unknown]",
        traits: [],
        bio: "[unknown]",
        description: "[unknown]",
        initialMemories: [],
    }

    log : string[] = [];

    constructor() {
        this.utils = new GenerativeUtils();
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

    async generateData(preData : SparkUserData) {

        this.$log("Generating data...");

        this.data = preData;


        if(preData.memoryId.length === 0) {
            this.data.memoryId = this.utils.generateUUID();
        }

        if(preData.name.length  === 0) {
            this.data.name = await this.generateName();
        }

        if(preData.userName.length  === 0) {
            this.data.userName = await this.generateUserName();
        }

        if(preData.traits.length  === 0) {
            this.data.traits = await this.generateTraits();
        }

        if(preData.description.length  === 0) {
            this.data.description = await this.generateDescription();
        }

        if(preData.initialMemories.length  === 0) {
            this.data.initialMemories = await this.generateMemories();
        }

        if(preData.bio.length  === 0) {
            this.data.bio = await this.generateBio();
        }

        return this.data;
    }


    async generateName() {
        this.$log("Generating name...");

        const types = 
        [
            "Fantasy",
            "Sci-Fi",
            "Mythologisch",
            "Fictief",
            "Nederlanse",
            "Engelse",
            "Japanse",
            "Italiaanse",
            "Klassieke",
            "Moderne",
            "Vintage",
            "Uniseks",
            "Sterk",
            "Zacht",
            "Grappig",
            "Mysterieus",
            "Natuur",
            "Kleur",
            "Dier",
            "Voedsel",
            "Historisch",
            "Technologisch",
            "Sportief",
            "Avontuurlijk",
            "Rooskleurig",
            "Donker",
            "Gothic",
            "Steampunk",
            "Cyberpunk",
            "Romantisch",
            "Episch",
            "Heroïsch",
            "Retro",
            "Middeleeuws",
            "Oosters",
            "Westers",
            "Mystiek"
        ];

        

        let type = types[Math.floor(Math.random() * types.length)];
        


        let genders = ["(mannelijke)", "(vrouw)", "(non-binaire)"];
        let gender = genders[Math.floor(Math.random() * genders.length)];
      
        type = type + " " + gender;

        this.$log("Choosing type " + type);

        return this.utils.complete(
            this.parseString(prompts.genCharacter.name.system, {type}),
            prompts.genCharacter.name.messages
        );
    }
    
    async generateUserName() {
        this.$log("Generating userName...");
        
        return this.utils.complete(
            this.parseString(prompts.genCharacter.userName.system, {name: this.data.name}),
            prompts.genCharacter.userName.messages
        );
    }

    async generateTraits() {
        this.$log("Generating traits...");
        
        const numberOfTraits = 3;
        const newTraits : string[] = [];

        if (traits.length === 0) {
            throw new Error("Traits array is empty");
        }
        
        if (traits.length < numberOfTraits) {
            throw new Error("Not enough distinct traits available.");
        }
        
        // get random traits, can't be duplicates
        while (newTraits.length < numberOfTraits) {
            let trait = traits[Math.floor(Math.random() * traits.length)].toLowerCase();
            if (!newTraits.includes(trait)) {
                newTraits.push(trait);
            }
        }

        return newTraits;
    }

    async generateDescription() {
        this.$log("Generating description...");

        return this.utils.complete(
            this.parseString(prompts.genCharacter.description.system, {
                name: `${this.data.name} (${this.data.userName})}`,
                traits: this.data.traits.join(",")
            }),
            prompts.genCharacter.description.messages
        );

    }

    async generateBio() {
        this.$log("Generating bio...");

        return this.utils.complete(
            this.parseString(prompts.genCharacter.shortBio.system, {
                description: this.data.description
            }),
            prompts.genCharacter.shortBio.messages
        );

    }


    async generateMemories() {
        this.$log("Generating memories...");

        const rawMemories = await this.utils.complete(
            this.parseString(prompts.genCharacter.makeMemories.system, {
                name: this.data.name,
                description: this.data.description
            }),
            prompts.genCharacter.makeMemories.messages
        );

        console.log("Memories: ", rawMemories);
        this.$log("Extracting memories...");

        const memories = await this.utils.complete(
            this.parseString(prompts.genCharacter.extractList.system, {
                content: rawMemories
            }),
            prompts.genCharacter.extractList.messages
        );

        console.log("Memories: ", memories);

        let memoriesJson = [];
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                memoriesJson = JSON.parse(memories);
                console.log("Memories JSON: ", memoriesJson);
                break;
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === 3) {
                    console.log("All attempts failed. Setting memoriesJson to an empty array.");
                }
            }
        }

        return memoriesJson;

    }

}