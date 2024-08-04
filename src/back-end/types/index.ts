export interface SparkUserData {
    memoryId: string,
    name: string,
    userName: string,
    traits: string[],
    description: string,
    bio: string,
    initialMemories: string[],
  }

  export interface SocialPost {
    postId: string,

    reactingTo?: string,
    agentId: string,
    
    topic: string,
    content: string,

    publishDate: string,

    reactions: SocialPost[]
}

