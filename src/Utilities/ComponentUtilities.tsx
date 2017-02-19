import * as React from "react";
import {StateManager} from "../StateManager";

export interface PropsBase{
    stateManager:StateManager;
}

export function arrayToList (array:any[]){
    let out = [];
    array.forEach((a)=>{out.push(<li>{a}</li>)});
    return out; 
}