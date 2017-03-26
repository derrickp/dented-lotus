import * as React from "react";
import * as ReactDOM from "react-dom"; 
import { Form, Input } from "formsy-react-components";
import * as UUID from "uuid/v1";

export interface TriviaProps{
    trivia:string[],
    canAddTrivia:boolean
    onAddNewTrivia:(trivia:string)=>Promise<void>;
}

export interface TriviaKey {
    key:string;
    trivia:string;
}

export class TriviaComponent extends React.Component<TriviaProps,any>{
    trivia :TriviaKey[] = [];
    onAddNewTrivia:(trivia:string)=>Promise<void>;
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
        this.state = {adding:false};
        this.onAddNewTrivia = props.onAddNewTrivia.bind(this);
    }

    addTrivia(){
        this.setState({adding:true});
    }

    getAddButton(){
        return <button onClick={this.addTrivia.bind(this)}>Add Trivia</button>
    }

    getTextBox(){
        const saveButton = <button type="submit" >Save</button>;
        return <Form onValidSubmit={this.save.bind(this)}>
            <Input layout="horizontal" type="text" name="trivia" label="New Trivia:" />
             {this.state.adding? saveButton : null}
       </Form>
    }

    save(model){
        this.onAddNewTrivia(model.trivia).then(()=>{
            this.setState({adding:false});
        })
    }
    
    render(){ 
        if (!this.trivia.length){
            return null;
        }
        const add = this.props.canAddTrivia ? this.getAddButton():null;
    const ts = this.trivia.map((t)=>{ return <li key={t.key}>{t.trivia}</li>});
        return <div> 
            <h3>Trivia</h3>
             <ul>{ts}</ul>  
             {this.state.adding? this.getTextBox() : add}
        </div>
    }
}