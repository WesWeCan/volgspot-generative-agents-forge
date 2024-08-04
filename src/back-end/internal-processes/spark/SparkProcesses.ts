
import { app, ipcMain } from 'electron';
import { shell } from 'electron';
import path from 'path';
import fs from "fs";

const userDataPath = app.getPath('userData');

import { SocialPost, SparkUserData } from '../../types';


// register in main.ts
export const registerSparkProcesses = async () => {

    setupFolders();

    ipcMain.on('getUserDataPath', (event) => { event.returnValue = getUserDataPath();  });

    ipcMain.on('openDataFolderInExplorer', (event) => { openDataFolderInExplorer(); });


    // Agents
    ipcMain.handle('loadAgentsData', async () => { return loadAgentsData(); });

    ipcMain.handle('loadAgentProfilePicture', async (event, memoryId) => { return loadAgentProfilePicture(memoryId); });

    ipcMain.handle('saveAgentData', async (event, data) => { return saveAgentData(data); });

    // Articles
    ipcMain.handle('loadArticleImage', async (event, articleId) => { return loadArticleImage(articleId); });

    ipcMain.handle('loadArticles', async () => { return loadArticles(); });

    ipcMain.handle('saveArticle', async (event, data) => { return saveArticle(data); });

    ipcMain.handle('saveArticleImage', async (event, data) => { return saveArticleImage(data); });


    // Social Posts
    ipcMain.handle('loadSocialPosts', async () => { return loadSocialPosts(); });

    ipcMain.handle('saveSocialPost', async (event, data) => { return saveSocialPost(data); });


}

const getUserDataPath = () => {
    return app.getPath('userData');
}


const setupFolders = () => {


    if (!fs.existsSync(path.join(userDataPath, "data"))) {
        fs.mkdirSync(path.join(userDataPath, "data"));
      }
  
      if (!fs.existsSync(path.join(userDataPath, "data", "agents"))) {
        fs.mkdirSync(path.join(userDataPath, "data", "agents"));
      }
  
      if (!fs.existsSync(path.join(userDataPath, "data", "articles"))) {
        fs.mkdirSync(path.join(userDataPath, "data", "articles"));
      }
  
      if (!fs.existsSync(path.join(userDataPath, "data", "social_posts"))) {
        fs.mkdirSync(path.join(userDataPath, "data", "social_posts"));
      }
}



const openDataFolderInExplorer = () => {
    shell.openPath(path.join(userDataPath, "data"));
  }






//   AGENTS ------------------------------------------------------------------------------------------------------------------------------------------------------------

const loadAgentsData = async () => {

    // read the agents folder
    const agentsFolder = path.join(userDataPath, "data", "agents");

    let folders = fs.readdirSync(agentsFolder, { withFileTypes: true });

    // filter to only folders
    folders = folders.filter(f => f.isDirectory());
    folders = folders.filter(f => f.name.toLowerCase() !== ".ds_store");

    console.log("folders: ", folders);

    let agentsData: SparkUserData[] = [];

    for (const folder of folders) {
      const dataFile = path.join(agentsFolder, folder.name, "data.json");
      const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));


      // check if the agent has a profile picture
      const profilePictureFile = path.join(agentsFolder, folder.name, "profile_picture.png");

      if (fs.existsSync(profilePictureFile)) {
        data.profilePicture = true;
      } else {
        data.profilePicture = false;
      }


      agentsData.push(data);
    }

    console.log("agentsData: ", agentsData);

    return agentsData;


  }

  const loadAgentProfilePicture = async (memoryId: string) => {


    try {
     
      if (!memoryId) {
        // res.status(400).json({ error: 'Memory ID is required' });
        return new Promise((resolve, reject) => {
          reject('Memory ID is required');
        });
      }
  

      const agentsFolder = path.join(userDataPath, "data", "agents");
      const agentFolder = path.join(agentsFolder, memoryId);

      // check if the agent has a profile picture
      const profilePictureFile = path.join(agentFolder, "profile_picture.png");

      if (fs.existsSync(profilePictureFile)) {
        const imageBuffer = fs.readFileSync(profilePictureFile);
        const imageUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;

        return new Promise((resolve) => {
          resolve({ imageUrl });
        });
      } else {
    
        return new Promise((resolve, reject) => {
          reject('Profile picture not found');
        });
      }
    } catch (error) {
    

      return new Promise((resolve, reject) => {
        reject('Internal API Error');
      });
    }
  


  }


  const saveAgentData = async (data: SparkUserData) => {

    // make or create dir with the memoryId
    if (!fs.existsSync(path.join(userDataPath, "data", "agents", data.memoryId))) {
      fs.mkdirSync(path.join(userDataPath, "data", "agents", data.memoryId));
    }

    // (overwrite)write the data to the file data.json
    fs.writeFileSync(path.join(userDataPath, "data", "agents", data.memoryId, "data.json"), JSON.stringify(data, null, 2));

  }


  const saveProfilePicture = async (data: { image: string, memoryId: string }) => {
    

    try {
      // find the folder with the memoryId in the agents folder
      const agentsFolder = path.join(userDataPath, "data", "agents");
      const agentFolder = path.join(agentsFolder, data.memoryId[0]);

      // Create the agent folder if it doesn't exist
      // if (!fs.existsSync(agentFolder)) {
      //   fs.mkdirSync(agentFolder, { recursive: true });
      // }

      let base64Data = data.image[0];
      if (base64Data.startsWith("data:image/jpeg;base64,")) {
        base64Data = base64Data.replace("data:image/jpeg;base64,", "");
      }

      const imagePath = path.join(agentFolder, "profile_picture.png");

      // Save the image file data to profile_picture.png
      fs.writeFileSync(imagePath, base64Data, 'base64'); // assuming data.image is a base64 encoded string

      
      return new Promise((resolve) => {
        resolve(true);
      });

    } catch (error) {
     
      return new Promise((resolve, reject) => {
        reject('Internal API Error');
      });
    }
  }




  // ARTICLES ------------------------------------------------------------------------------------------------------------------------------------------------------------



  const loadArticleImage = async (articleId : string) => {
    try {
      
      if (!articleId) {
        
        return new Promise((resolve, reject) => {
          reject('Article ID is required');
        });
      
      }
      
      const articlesFolder = path.join(userDataPath, "data", "articles");
      const articleFolder = path.join(articlesFolder, articleId);
      
      // check if the article has an image
      const imageFile = path.join(articleFolder, "article_image.png");
    
      if (fs.existsSync(imageFile)) {
        const imageBuffer = fs.readFileSync(imageFile);
        const imageUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;
        
        return new Promise((resolve) => {
          resolve({ imageUrl });
        });
      } else {
      
        return new Promise((resolve, reject) => {
          reject('Article image not found');
        });
      }
    } catch (error) {
      return new Promise((resolve, reject) => {
        reject('Internal API Error');
      });
    }
  }


  const loadArticles = async () => {
    // read the articles folder
    const articlesFolder = path.join(userDataPath, "data", "articles");
    let folders = fs.readdirSync(articlesFolder, { withFileTypes: true });
    folders = folders.filter(f => f.isDirectory());
    folders = folders.filter(f => f.name.toLowerCase() !== ".ds_store");
    console.log("folders: ", folders);
    let articlesData = [];
    for (const folder of folders) {
      const dataFile = path.join(articlesFolder, folder.name, "data.json");
      const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));

      // check if the article has an image
      const imageFile = path.join(articlesFolder, folder.name, "article_image.png");

      if (fs.existsSync(imageFile)) {
        data.image = true;
      } else {
        data.image = false;
      }


      articlesData.push(data);
    }
    // console.log("articlesData: ", articlesData);
    return articlesData;
  }


  const saveArticle = async (data : any) => {
    // make or create dir with the articleId
    if (!fs.existsSync(path.join(userDataPath, "data", "articles", data.articleId))) {
      fs.mkdirSync(path.join(userDataPath, "data", "articles", data.articleId));
    }

    // (overwrite)write the data to the file data.json
    fs.writeFileSync(path.join(userDataPath, "data", "articles", data.articleId, "data.json"), JSON.stringify(data, null, 2));


    return new Promise((resolve) => {
      resolve(true);
    });

  }



  const saveArticleImage = async (data: { image: string, articleId: string }) => {
    
    try {
      // find the folder with the articleId in the articles folder
      const articlesFolder = path.join(userDataPath, "data", "articles");
      const articleFolder = path.join(articlesFolder, data.articleId[0]);

      // Create the article folder if it doesn't exist
      if (!fs.existsSync(articleFolder)) {
        fs.mkdirSync(articleFolder, { recursive: true });
      }

      let base64Data = data.image[0];
      if (base64Data.startsWith("data:image/jpeg;base64,")) {
        base64Data = base64Data.replace("data:image/jpeg;base64,", "");
      }

      const imagePath = path.join(articleFolder, "article_image.png");

      // Save the image file data to image.png
      fs.writeFileSync(imagePath, base64Data, 'base64'); // assuming data.image is a base64 encoded string

      return new Promise((resolve) => {
        resolve(true);
      });
    } catch (error) {
      
      return new Promise((resolve, reject) => {
        reject('Internal API Error');
      });
    }
  }







  // SOCIAL POSTS ------------------------------------------------------------------------------------------------------------------------------------------------------------

  const loadSocialPosts = async () => {

    // read the social posts folder
    const socialPostsFolder = path.join(userDataPath, "data", "social_posts");
    let folders = fs.readdirSync(socialPostsFolder, { withFileTypes: true });
    folders = folders.filter(f => f.isDirectory());
    folders = folders.filter(f => f.name.toLowerCase() !== ".ds_store");
    console.log("folders: ", folders);

    let socialPostsData : SocialPost[] = [];
    for (const folder of folders) {
      
      let jsonFiles = fs.readdirSync(path.join(socialPostsFolder, folder.name), { withFileTypes: true });
      jsonFiles = jsonFiles.filter(f => f.isFile());
      jsonFiles = jsonFiles.filter(f => f.name.toLowerCase().endsWith(".json"));
      
      for (const jsonFile of jsonFiles) {
        const dataFile = path.join(socialPostsFolder, folder.name, jsonFile.name);
        const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));
        socialPostsData.push(data);
      }
    }

    // console.log("articlesData: ", articlesData);
    return socialPostsData;
  }



  const saveSocialPost = async (data: SocialPost) => {

    // make or create dir with the articleId
    if (!fs.existsSync(path.join(userDataPath, "data", "social_posts", data.agentId + "_posts"))) {
      fs.mkdirSync(path.join(userDataPath, "data", "social_posts", data.agentId + "_posts"));
    }

    // (overwrite)write the data to the file data.json
    fs.writeFileSync(path.join(userDataPath, "data", "social_posts", data.agentId + "_posts", data.postId + ".json"), JSON.stringify(data, null, 2));
    

    return new Promise((resolve) => {
      resolve(true);
    });
  }