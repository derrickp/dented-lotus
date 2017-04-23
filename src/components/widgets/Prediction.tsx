import * as React from "react";
import * as ReactDom from "react-dom";
import { DriverModel } from "../../../common/models/Driver";
import { DriverResponse } from "../../../common/responses/DriverResponse";
import { TeamModel } from "../../../common/models/Team";
import { TeamResponse } from "../../../common/responses/TeamResponse";
import { Selectable } from "../../../common/models/Selectable";
import { PredictionModel } from "../../../common/models/Prediction";
import { PredictionResponse } from "../../../common/responses/PredictionResponse";
import { SelectBox, SelectOption } from "../../../react-select-component/SelectBox";
import { MenuItem, FormControl, Well, FormGroup } from "react-bootstrap";
import SnackBar from "material-ui/Snackbar";

export interface PredictionProps {
    prediction: PredictionModel;
    save: (prediction: PredictionModel) => Promise<boolean>;
    allowedPrediction: boolean;
}

export interface PredictionState {
    validationState: "success" | "warning" | "error";
    snackbarOpen: boolean;
    snackbarText: string;
}

export class PredictionComponent extends React.Component<PredictionProps, PredictionState>{
    /**
     *
     */
    constructor(props: PredictionProps) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.handleRequestSnackbarClose = this.handleRequestSnackbarClose.bind(this);
        this.state = {
            validationState: null,
            snackbarOpen: false,
            snackbarText: ""
        };
    }

    onChange(event: React.ChangeEvent<any>) {
        const value = event.target.value !== "not-app" ? event.target.value : null;
        this.props.prediction.predictionResponse.userPick = event.target.value;
        this.setState({ validationState: "warning" });
        this.props.save(this.props.prediction).then(success => {
            this.setState({
                validationState: success ? "success" : "error",
                snackbarOpen: true,
                snackbarText: success ? "Pick saved successfully" : "Error saving pick. Try again."
            });
            setTimeout(() => {
                this.setState({ validationState: null });
            }, 1000);
        });
    }

    getOption(selectable: Selectable): JSX.Element {
        return <option key={selectable.key} value={selectable.key}>{selectable.display}</option>;
    }

    handleRequestSnackbarClose() {
        this.setState({ snackbarOpen: false });
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
        return (
            <div>
                <Well bsSize="small">
                    <h3>{prediction.json.title}</h3>
                    <h4>{prediction.json.description}</h4>
                    {formControl}
                </Well>
                <SnackBar open={this.state.snackbarOpen}
                message={this.state.snackbarText}
                autoHideDuration={2000}
                onRequestClose={this.handleRequestSnackbarClose}>
                </SnackBar>
            </div>
        );
    }
}