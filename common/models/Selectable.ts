import {PredictionModel} from "../models/Prediction";

export interface Selectable {
    key: string;
    display: string; 
}

export interface SelectableObject {
    key: string;
    display: string;
    points: number;
    multiplier: number;  
}