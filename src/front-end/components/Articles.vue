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

const context = ref("");
import { topics } from '../assets/GenerativeArticles/Topics';

const apiUrl = inject<Ref<string>>("apiUrl");

onMounted(async () => {
    console.log("Topics: ", topics.length);

    await loadArticles();

    // await createImages();

    // writeArticles();

    // uploadArticlesToSpark();

});

const createArticles = async () => {
    // for (let i = 0; i < 400; i++) {
    //     let article = new GenerativeArticle();
    //     await article.generateData();
    //     articles.value.push(article);
    //     await article.saveData();

    // }
}



const uploadArticlesToSpark = async () => {

    for (const article of articles.value) {
        console.log(article)
        let imageUrl = "";
        
        // load the image as a file for form data

        imageUrl = await window.sparkAPI.loadArticleImage(article.data.articleId).then((response) => {
            console.log("Article image loaded: ", response.imageUrl);
            return response.imageUrl;
        });



        console.log("Image URL: ", imageUrl);

        const formData = new FormData();

        let image = new Image();
        image.src = imageUrl;
        console.log("Image src: ", image.src);

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

       
    }


}



const loadArticles = async () => {

    const rawArticles = await window.sparkAPI.loadArticles();

    for (const article of rawArticles) {
        const articleData = new GenerativeArticle();
        articleData.loadData(article);
        articles.value.push(articleData);
    }

}

const createImages = async () => {

    for (let i = 0; i < articles.value.length; i++) {
        if (articles.value[i].data.image === false) {
            console.log("No Image for article " + i + " of " + articles.value.length);

            await articles.value[i].generateImage();
        }

        // await articles.value[i].generateImage();
        // console.log("Created image for article " + i + " of " + articles.value.length);
    }

}


const writeArticles = async () => {


    console.log("Writing articles...");

    const start = 0;

    for (let i = start; i < topics.length; i++) {
        let article = new GenerativeArticle();
        await article.writeArticle(topics[i]);
        await article.saveData();

        console.log(i + " of " + topics.length + " articles written");
    }
}

const shuffleTopics = () => {

    // shuffle the topics
    let shuffledTopics = topics.sort(() => 0.5 - Math.random());


    // split the topics into 32 arrays based on the length of the array
    const splitTopics = shuffledTopics.reduce((acc, curr, i) => {
        const index = i % 32;
        acc[index].push(curr);
        return acc;
    }, [...Array(32)].map(() => []));

    console.log("Split topics: ", splitTopics);

}


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


    <div v-for="(topic, index) in topics">
        <h3>{{ topic }}</h3>
        <button @click="topics.splice(index, 1)">Remove</button>
        <br>
    </div>

    <button @click="copyAsJson">Copy as JSON</button>


    <textarea v-model="context" type="text" placeholder="Context" />


    <button @click="createTopics">Create Topics</button>





    <!-- <button @click="createArticle">Create Article</button> -->

</template>