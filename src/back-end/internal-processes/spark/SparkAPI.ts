import { contextBridge, ipcRenderer } from 'electron';

import { SocialPost, SparkUserData,  } from '../../types';

declare global {
    interface Window {
        sparkAPI: {
            
            // General
            getUserDataPath: () => string;
            openDataFolderInExplorer: () => void;

            // Agents
            loadAgentsData: () => Promise<SparkUserData[]>;

            saveAgentData: (data: SparkUserData) => Promise<void>;

            saveProfilePicture: (data: any) => Promise<void>;

            loadAgentProfilePicture: (memoryId: string) => Promise<{ imageUrl: string }>;

        
            

            // Articles
            loadArticleImage: (articleId: string) => Promise<{ imageUrl: string }>;

            loadArticles: () => Promise<any[]>;

            saveArticle: (data: any) => Promise<void>;

            saveArticleImage: (data: any) => Promise<void>;

            
            // Social Posts
            loadSocialPosts: () => Promise<SocialPost[]>;
            saveSocialPost: (data: SocialPost) => Promise<void>;
            
        }
    }
}


// register in preload.ts
export const preloadSparkAPI = () => {
    contextBridge.exposeInMainWorld('sparkAPI', {
        getUserDataPath: () => ipcRenderer.invoke('getUserDataPath'),
        openDataFolderInExplorer: () => ipcRenderer.send('openDataFolderInExplorer'),

        // Agents
        loadAgentsData: () => ipcRenderer.invoke('loadAgentsData'),

        loadAgentProfilePicture: (memoryId: string) => ipcRenderer.invoke('loadAgentProfilePicture', memoryId),

        saveAgentData: (data: SparkUserData) => ipcRenderer.invoke('saveAgentData', data),

        saveProfilePicture: (data: any) => ipcRenderer.invoke('saveProfilePicture', data),

        // Articles
        loadArticleImage: (articleId: string) => ipcRenderer.invoke('loadArticleImage', articleId),

        loadArticles: () => ipcRenderer.invoke('loadArticles'),

        saveArticle: (data: any) => ipcRenderer.invoke('saveArticle', data),

        saveImage: (data: any) => ipcRenderer.invoke('saveArticleImage', data),

        // Social Posts
        loadSocialPosts: () => ipcRenderer.invoke('loadSocialPosts'),

        saveSocialPost: (data: SocialPost) => ipcRenderer.invoke('saveSocialPost', data)
    });
}