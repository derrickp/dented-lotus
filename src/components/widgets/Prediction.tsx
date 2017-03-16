import * as React from "react";
import * as ReactDom from "react-dom";
import {DriverModel, DriverResponse} from "../../../common/models/Driver";
import {TeamModel, TeamResponse} from "../../../common/models/Team"; 
import {PredictionModel, PredictionResponse} from "../../../common/models/Prediction";
import {SelectBox,SelectOption} from "../../../react-select-component/SelectBox";

export interface PredictionProps{
    prediction: PredictionModel;
}

export interface PredictionState{

}

export class PredictionComponent extends React.Component<PredictionProps, PredictionState>{
    /**
     *
     */
    constructor(props:PredictionProps) {
        super(props);

    }

    onSelectionChanged(option:SelectOption){
        alert(option.display+ " - " + option.value);
    }

    getSelectOption(c): SelectOption{
        return  c.hasOwnProperty("firstName") ? {display : c["firstName"] + " " + c["lastName"], value: c} : {display : c["name"], value:c}
    }

    render(){
        let options =  this.props.prediction.json.choices.map((c)=>{return this.getSelectOption(c);});
        return <div className="prediction-box">
                <h1>{this.props.prediction.json.title}</h1>
                <span>{this.props.prediction.json.description}</span>
                <div>
                    <SelectBox isStrings={false} label="Your selection" onOptionChanged={this.onSelectionChanged.bind(this)} options={options} selectMessage="Make Your Pick" strings={[]} />
                    </div>
            </div>

    }
}