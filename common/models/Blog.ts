import { UserResponse } from "./User";

export interface BlogResponse {
    postDate: string;
    message: string;
    author: UserResponse;
    title: string;
    imageUrl?: string;
}