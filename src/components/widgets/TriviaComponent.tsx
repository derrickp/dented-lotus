import * as React from "react";
import * as ReactDOM from "react-dom"; 
import * as UUID from "uuid/v1";

export interface TriviaProps{
    trivia:string[]
}

export interface TriviaKey {
    key:string;
    trivia:string;

}

export class TriviaComponent extends React.Component<TriviaProps,any>{
    trivia :TriviaKey[] = [];
    /**
     *
     */
    constructor(props:TriviaProps) {
        super(props);
        props.trivia.forEach((t)=>{
            this.trivia.push({
                key: UUID(),
                trivia:t
            })
        });
        
    }

    render(){ 
        if (!this.trivia.length){
            return null;
        }
        const ts = this.trivia.map((t)=>{ return <li key={t.key}>{t.trivia}</li>});
        return <ul>{ts}</ul>
    }
}