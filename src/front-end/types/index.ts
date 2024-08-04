export type ExampleCount = {
    count: number;
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