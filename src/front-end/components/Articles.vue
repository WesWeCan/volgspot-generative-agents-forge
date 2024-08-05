<script setup lang="ts">

import { ref, onMounted, inject, Ref } from 'vue';
import { GenerativeArticle } from '../assets/GenerativeArticles/GenerativeArticle';
import { GenerativeUtils } from '../assets/GenerativeUtils';

import axios from 'axios';

let articles = ref<GenerativeArticle[]>([]);

const createArticle = async () => {
    let article = new GenerativeArticle();
    articles.value.push(article);
}


import { importedTopics } from '../assets/GenerativeArticles/Topics';
const topics = ref<string[]>([]);


const context = ref("");

const apiUrl = inject<Ref<string>>("apiUrl");

onMounted(async () => {

   

    await loadArticles();


});


const numNewArticles = ref(5);
const createArticles = async () => {

    for (let i = 0; i < numNewArticles.value; i++) {
        let article = new GenerativeArticle();
        await article.generateData();
        articles.value.push(article);
        await article.saveData();

    }
}


const uploadArticlsProgress = ref(0);
const uploadArticlesToSpark = async () => {

    uploadArticlsProgress.value = 0;

    for (let i = 0; i < articles.value.length; i++) {
        const article = articles.value[i];
        console.log(article)
        let imageUrl = "";

        // load the image as a file for form data

        imageUrl = await window.sparkAPI.loadArticleImage(article.data.articleId).then((response) => {
            // console.log("Article image loaded: ", response.imageUrl);
            return response.imageUrl;
        }).catch((error) => {
            console.log("Error loading article image: ", error);
            return "";
        });



        // console.log("Image URL: ", imageUrl);

        const formData = new FormData();

        let image = new Image();
        image.src = imageUrl;
        // console.log("Image src: ", image.src);

        image.onload = async () => {

            console.log("Image loaded");
            const formData = new FormData();

            const response = await fetch(image.src);
            const blob = await response.blob();
            const file = new File([blob], `article_image.png`, {
                type: `image/png`
            });

            console.log("Filename: ", file.name);

            formData.append("image", file);



            formData.append("article_id", article.data.articleId);
            formData.append("title", article.data.title);
            formData.append("content", article.data.content);
            formData.append("publish_date", article.data.publishDate);

            axios.request({
                url: `${apiUrl.value}/article-store`,
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

        uploadArticlsProgress.value = Math.floor((i / articles.value.length) * 100);

    }

    uploadArticlsProgress.value = 100;

}



const loadArticles = async () => {

    const rawArticles = await window.sparkAPI.loadArticles();

    for (const article of rawArticles) {
        const articleData = new GenerativeArticle();
        articleData.loadData(article);
        articles.value.push(articleData);
    }

}


const creatingImagesProgress = ref(0);
const createImagesForArticles = async () => {
    creatingImagesProgress.value = 0;

    for (let i = 0; i < articles.value.length; i++) {
        if (articles.value[i].data.image === false) {
            console.log("No Image for article " + i + " of " + articles.value.length);

            await articles.value[i].generateImage();
        }

        creatingImagesProgress.value = Math.floor((i / articles.value.length) * 100);

        // await articles.value[i].generateImage();
        // console.log("Created image for article " + i + " of " + articles.value.length);
    }

    creatingImagesProgress.value = 100;
}

const writeProgress = ref(0);
const writeArticles = async () => {


    console.log("Writing articles...");

    const start = 0;

    for (let i = start; i < topics.value.length; i++) {
        let article = new GenerativeArticle();
        await article.writeArticle(topics.value[i]);
        await article.saveData();

        console.log((i+1) + " of " + topics.value.length + " articles written");
        writeProgress.value = Math.floor((i / topics.value.length) * 100);
    }
}

// const shuffleTopics = () => {

//     // shuffle the topics
//     let shuffledTopics = topics.sort(() => 0.5 - Math.random());


//     // split the topics into 32 arrays based on the length of the array
//     const splitTopics = shuffledTopics.reduce((acc, curr, i) => {
//         const index = i % 32;
//         acc[index].push(curr);
//         return acc;
//     }, [...Array(32)].map(() => []));

//     console.log("Split topics: ", splitTopics);

// }


const createTopics = async () => {

    let article = new GenerativeArticle();
    topics.value = await article.generateTopics(context.value);

    console.log("Topics: ", topics.value);

    // concatenate the topics to topics
    topics.value = topics.value.concat(topics.value);
}


const copyAsJson = () => {
    navigator.clipboard.writeText(JSON.stringify(topics.value));
}



</script>

<template>

    <h1>Generative Articles</h1>


    <details>
        <summary>Controls</summary>




        <div class="controls">

            <!-- <div class="control">
                <form @submit.prevent>
                    <input type="number" v-model="numNewArticles" placeholder="Number of Articles">
                    <button @click="() => {createArticles()}">Create {{ numNewArticles }} Articles</button>
                </form>
            </div> -->





            <div class="control">
                <button @click="createImagesForArticles">Create Images</button>
                <small>Wait for alert message until Comfy is done</small>
                <progress v-if="creatingImagesProgress" :value="creatingImagesProgress" max="100"></progress>
            </div>



            <div class="control">
                <button @click="uploadArticlesToSpark">Upload to Spark</button>
                <progress v-if="uploadArticlsProgress" :value="uploadArticlsProgress" max="100"></progress>
            </div>
        </div>





    </details>

    <details>
        <summary>Topics</summary>
        <div class="controls">
            <div class="control">

                <form @submit.prevent>
                    <textarea v-model="context" placeholder="Context"></textarea>
                    <button @click="() => { createTopics() }">Create Topics</button>
                </form>


            </div>

            <div class="control">
                <button @click="writeArticles">Write Articles from Topics</button>
            </div>
        </div>

        <div v-for="(topic, index) in topics">
            <h3>{{ topic }}</h3>
            <button @click="topics.splice(index, 1)">Remove</button>
            <br>
        </div>
        
        <button @click="copyAsJson" v-if="topics.length > 0">Copy Topics as JSON</button>
    </details>



    <details>
        <summary>Articles</summary>
        <div v-for="(article, index) in articles">
            <details>
                <summary>{{ article.data.title }}</summary>

                <div class="article-content" v-html="article.data.content"></div>

                <span>IMG: {{ article.data.image }}</span>

            </details>

            <!-- <button @click="articles.splice(index, 1)">Remove</button>
            <br> -->
        </div>
    </details>

</template>