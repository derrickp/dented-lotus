import { UserResponse } from "../responses/UserResponse";

export interface BlogResponse {
    postDate: string;
    message: string;
    author: UserResponse;
    title: string;
    imageUrl?: string;
}