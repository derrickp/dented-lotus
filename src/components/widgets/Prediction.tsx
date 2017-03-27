import * as React from "react";
import * as ReactDom from "react-dom";
import { DriverModel, DriverResponse } from "../../../common/models/Driver";
import { TeamModel, TeamResponse } from "../../../common/models/Team";
import { Selectable } from "../../../common/models/Selectable";
import { PredictionModel, PredictionResponse } from "../../../common/models/Prediction";
import { SelectBox, SelectOption } from "../../../react-select-component/SelectBox";
import { MenuItem, FormControl, Well, FormGroup } from "react-bootstrap";

export interface PredictionProps {
    prediction: PredictionModel;
    save: (prediction: PredictionModel) => Promise<boolean>;
    allowedPrediction: boolean;
}

export interface PredictionState {
    validationState: "success" | "warning" | "error";
}

export class PredictionComponent extends React.Component<PredictionProps, PredictionState>{
    /**
     *
     */
    constructor(props: PredictionProps) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.state = {
            validationState: null
        };
    }

    onChange(event: React.ChangeEvent<any>) {
        const value = event.target.value !== "not-app" ? event.target.value : null;
        this.props.prediction.predictionResponse.userPick = event.target.value;
        this.setState({ validationState: "warning" });
        this.props.save(this.props.prediction).then(success => {
            this.setState({ validationState: success ? "success" : "error" });
            if (!success) {
                alert("Failed to save pick. Try again");
            }
            setTimeout(() => {
                this.setState({ validationState: null });
            }, 1000);
        });
    }

    getOption(selectable: Selectable): JSX.Element {
        return <option key={selectable.key} value={selectable.key}>{selectable.display}</option>;
    }

    render() {
        const prediction = this.props.prediction;
        const options: JSX.Element[] = [];
        const placeholder = <option key={"not-app"} value={"not-app"} >Make your pick</option>;
        options.push(placeholder);
        const userChoices = prediction.predictionResponse.userPick;
        for (const c of prediction.choices) {
            options.push(this.getOption(c));
        }
        const formControl =
            <FormGroup key={prediction.json.key} validationState={this.state.validationState} bsSize="large">
                <FormControl disabled={!this.props.allowedPrediction} defaultValue={userChoices} onChange={this.onChange} id={prediction.json.key} componentClass="select" placeholder="Make your pick">
                    {options}
                </FormControl>
            </FormGroup>;
        return <Well bsSize="small">
            <h3>{prediction.json.title}</h3>
            <h4>{prediction.json.description}</h4>
            {formControl}
        </Well>;
    }
}