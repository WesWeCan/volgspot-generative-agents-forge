<script setup lang="ts">

import { ref, onMounted, inject, Ref } from 'vue';
import { SparkUser, SparkUserData } from '../assets/GenerativeAgents/SparkUser';

import axios from 'axios';
import moment, { max } from 'moment';
import { SocialPost } from '../types';

let agents = ref<SparkUser[]>([]);

const apiUrl = inject<Ref<string>>("apiUrl");


const socialPosts = ref<SocialPost[]>([]);

const numNewAgents = ref(5);
const creatingAgents = ref(false);


onMounted(async () => {
    await loadAgentsData();
    // await createProfilePictures();

    console.log(apiUrl.value);

    

    // for(let i = 0; i < agents.value.length; i++) {
    //    await agents.value[i].generateProfilePicture();
    // }




    // for (const agent of customUsers.value) {
    //     const sparkUser = new SparkUser(agent);

    //     await sparkUser.generateData();
    //     sparkUser.saveData();
    //     agents.value.push(sparkUser);


    // }

    await loadSocialPosts();
    // generatePosts();

    // uploadAgentsToSpark();
    // uploadPostsToSpark();

});



const createAgent = async () => {
    let agent = new SparkUser();
    await agent.generateData();
    agents.value.push(agent);
    await agent.saveData();


    return new Promise((resolve) => {
        resolve(true);
    });

}


const createAgentsProgress = ref(0);
const createAgents = async () => {

    if(creatingAgents.value) {
        console.log("Already creating agents");
        return;
    }

    creatingAgents.value = true;

    for (let i = 0; i < numNewAgents.value; i++) {
        await createAgent();
        createAgentsProgress.value = Math.floor(i / numNewAgents.value * 100);
    }
}




const loadAgentsData = async () => {

    window.sparkAPI.loadAgentsData().then((response) => {

        console.log("Agents data: ", response);

        // sort on name
        response.sort((a: any, b: any) => a.name.localeCompare(b.name));

        for (const agent of response) {

            const sparkUser = new SparkUser(agent);
            agents.value.push(sparkUser);
        }

    });

    return new Promise((resolve) => {
        resolve(true);
    });

}

const profilePictureProgress = ref(0);
const createProfilePictures = async () => {

    profilePictureProgress.value = 0;

    for (let i = 0; i < agents.value.length; i++) {
        if (agents.value[i].data.profilePicture === false) {
            console.log("No profile picture for agent " + i + " of " + agents.value.length);
            await agents.value[i].generateProfilePicture();
        }
        else {
            console.log("Profile picture for agent " + (i+1) + " of " + agents.value.length + " already exists");
        }

        profilePictureProgress.value = Math.floor(i / agents.value.length * 100);

        // await agents.value[i].generateProfilePicture();
        // console.log("Created profile picture for agent " + i + " of " + agents.value.length);
    }

    profilePictureProgress.value = 100;
}




const loadSocialPosts = async () => {

    window.sparkAPI.loadSocialPosts().then((response) => {
        console.log("Social posts: ", response);
        socialPosts.value = response;
    });
}


const uploadPostProgress = ref(0);

const uploadPostsToSpark = async () => {

    uploadPostProgress.value = 0;

    for (let i = 0; i < socialPosts.value.length; i++) {

        let post = socialPosts.value[i];

        console.log("Post: ", post);

        await uploadPostToSpark(post);

        for (let j = 0; j < post.reactions.length; j++) {
            await uploadPostToSpark(post.reactions[j]);
        }



        uploadPostProgress.value = Math.floor(i / socialPosts.value.length * 100);  


    }

    uploadPostProgress.value = 100;

}


const uploadPostToSpark = async (post: SocialPost) => {
    const formData = new FormData();

    formData.append("post_id", post.postId);
    formData.append("agent_id", post.agentId);
    formData.append("topic", post.topic);
    formData.append("content", post.content);
    formData.append("published_at", post.publishDate);
    formData.append("reacting_to", post.reactingTo || "");

    await axios.request({
        url: `${apiUrl.value}/post-store`,
        data: formData,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
            console.log("Upload progress: ", progressEvent.loaded, progressEvent.total);
        }
    })


    return new Promise((resolve) => {
        resolve(true);
    });
}

const getPublishDate = () => {

    let from = moment('2024-08-01');
    let to = moment('2025-03-15');

    let randomDate = from.add(Math.floor(Math.random() * (to.diff(from, 'days'))), 'days');

    // set random time
    randomDate.hour(Math.floor(Math.random() * 24));
    randomDate.minute(Math.floor(Math.random() * 60));

    // format for laravel carbon
    return randomDate.format('YYYY-MM-DD HH:mm:ss');
}

const getReactionDate = (publishDate: string) => {

    let from = moment(publishDate);

    let quickReplyChance = .45;
    let maxTime = (24 * 1.25) * 60; // Maximum number of minutes for reaction time

    if (Math.random() < quickReplyChance) {
        maxTime = (24 * 0.05) * 60; // Shorter maximum number of minutes for quick replies
    }

    // Add random amount of minutes after publishDate
    let to = from.add(Math.floor(Math.random() * maxTime), 'minutes');


    // format for laravel carbon
    return to.format('YYYY-MM-DD HH:mm:ss');

}



const postsGenerationProgress = ref(0);
const postCurrentGenerationProgress = ref(0);

const createPostsForAgents = async () => {

    postsGenerationProgress.value = 0;
    postCurrentGenerationProgress.value = 0;

    for (let i = 0; i < agents.value.length; i++) {


        let agent = agents.value[i];

        // check if the agent has already a post
        let index = socialPosts.value.findIndex(post => post.agentId === agent.data.memoryId);
        if (index !== -1) {
            console.log("Agent " + agent.data.userName + " already has a post");
            continue;
        }

        let topics = await agent.brainstormTopics();

        console.log("Topics: ", topics);

        // check if the topics array is an array

        if (!Array.isArray(topics)) {
            console.log("Topics is not an array");
            continue;
        }

        // shuffle the topics
        topics = topics.sort(() => 0.5 - Math.random());

        // pick a random number of topics
        const numTopics = Math.floor(Math.random() * topics.length) || 1;
        console.log("Number of topics to generate a post about: ", numTopics);

        for (let j = 0; j < numTopics; j++) {
            let topic = topics[j];

            console.log("Writing post about topic: " + topic);
            let postContent = await agent.writePost(topic);

            console.log("Post: ", postContent);

            let newPost: SocialPost = {
                postId: agent.data.memoryId + "_" + Math.floor(Math.random() * 10000),
                agentId: agent.data.memoryId,
                topic: topic,
                content: postContent,
                publishDate: getPublishDate(),
                reactions: []
            }

            // random between 1 and 15
            const numReactions = Math.floor(Math.random() * 7) || 1;
            console.log("Number of reactions to post: ", numReactions);

            // pick random agents based on the number of reactions
            for (let k = 0; k < numReactions; k++) {
                let reactionAgent = agents.value[Math.floor(Math.random() * agents.value.length)];

                let context = "A post on social media about " + topic;
                let reactionContent = await reactionAgent.react(context, postContent);
                console.log("Reaction: ", reactionContent);

                let newReaction: SocialPost = {
                    postId: reactionAgent.data.memoryId + "_" + Math.floor(Math.random() * 10000),
                    agentId: reactionAgent.data.memoryId,
                    topic: topic,
                    content: reactionContent,
                    publishDate: getReactionDate(newPost.publishDate),
                    reactingTo: newPost.postId,
                    reactions: []
                }

                newPost.reactions.push(newReaction);
                console.log("Reaction " + k + " from agent " + reactionAgent.data.userName + "of " + numReactions);

                postCurrentGenerationProgress.value = Math.floor(k / numReactions * 100);
            }



            console.log("Saving post: ", newPost);

            await window.sparkAPI.saveSocialPost(newPost);

            
        }

        console.log("Generated posts for agent " + i + " of " + agents.value.length);

        postsGenerationProgress.value = Math.floor(i / agents.value.length * 100);

    }

    postsGenerationProgress.value = 100;
    postCurrentGenerationProgress.value = 0;


}



const uploadProgress = ref(0);

const uploadAgentsToSpark = async () => {

    uploadProgress.value = 0;

    for (let i = 0; i < agents.value.length; i++) {

        let imageUrl = "";


        imageUrl = await window.sparkAPI.loadAgentProfilePicture(agents.value[i].data.memoryId).then((response) => {
            // console.log("Agent image loaded: ", response.imageUrl);
            return response.imageUrl;
        });

   

        const formData = new FormData();

        let image = new Image();
        image.src = imageUrl;
    
        image.onload = async () => {

            console.log("Image loaded");
            const formData = new FormData();

            const response = await fetch(image.src);
            const blob = await response.blob();
            const fileExtension = image.src.split('.').pop().split(/\#|\?/)[0];
            const file = new File([blob], `profile_picture.png`, {
                type: `image/${fileExtension}`
            });
            console.log("Filename: ", file.name);

            formData.append("avatar", file);

            formData.append("memory_id", agents.value[i].data.memoryId);

            formData.append("name", agents.value[i].data.name);
            formData.append("username", agents.value[i].data.userName);
            formData.append("traits", JSON.stringify(agents.value[i].data.traits));
            formData.append("description", agents.value[i].data.description);
            formData.append("bio", agents.value[i].data.bio);
            formData.append("initial_memories", JSON.stringify(agents.value[i].data.initialMemories));



            axios.request({
                // url: "https://volgspot-de-spark.test/api/agent-store",
                url: `${apiUrl.value}/agent-store`,
                data: formData,
                method: "POST",
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                onUploadProgress: (progressEvent) => {
                    console.log("Upload progress: ", progressEvent.loaded, progressEvent.total);
                }
            }
            )

        }

        uploadProgress.value = Math.floor(i / agents.value.length * 100);

    }

    uploadProgress.value = 100;


}

</script>


<template>

    <h1>Generative Agents</h1>

    <details>
        <summary>Controls</summary>

    <div class="controls">

        
       
        <div class="control">
            <form @submit.prevent>
                <input type="number" v-model="numNewAgents" placeholder="Number of Agents">
                <button @click="() => {createAgents()}">Create {{ numNewAgents }} Agents</button>
            </form>
        </div>

        <div class="control">
            <button @click="createProfilePictures">Create Profile Pictures</button>
            <progress max="100" v-if="profilePictureProgress !== 0" :value="profilePictureProgress"></progress>
        </div>

        <div class="control">
            <button @click="uploadAgentsToSpark">Upload Agents to Spark</button>
            <progress max="100" v-if="uploadProgress !== 0" :value="uploadProgress"></progress>
        </div>


        <hr>

        <div class="control">
            <button @click="createPostsForAgents">Create Posts for Agents</button>
            
            <progress max="100" v-if="postCurrentGenerationProgress !== 0" :value="postCurrentGenerationProgress"></progress>
            <progress max="100" v-if="postsGenerationProgress !== 0" :value="postsGenerationProgress"></progress>
   
        </div>

        <div class="control">
            <button @click="uploadPostsToSpark">Upload Posts to Spark</button>
            <progress max="100" v-if="uploadPostProgress !== 0" :value="uploadPostProgress"></progress>
        </div>
        

    </div>
    </details>


    <details>
        <summary>Generated Agents</summary>
    <div v-for="(agent, index) in agents">


        <details>
            <summary>{{ agent.data.name }} {{ agent.data.userName }} - ({{ agent.data.traits.join(', ') }})</summary>
            <div>
                <small>{{ agent.data.memoryId }}</small>
                <p>{{ agent.data.bio }}</p>
                <details>
                    <summary>Description</summary>
                    <p>{{ agent.data.description }}</p>
                </details>
                <details>
                    <summary>Memories</summary>
                    <ul>
                        <li v-for="memory in agent.data.initialMemories">{{ memory }}</li>
                    </ul>
                </details>

               
            </div>
        </details>



    </div>

    </details>

</template>