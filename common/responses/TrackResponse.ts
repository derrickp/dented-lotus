export interface TrackResponse {
    key: string;
    name: string;
    country: string;
    length?: number;
    title: string;
    trivia?: string[];
    description?: string;
    latitude?: number;
    longitude?: number;
    info?:string;
    image?:string;
}