import * as React from "react";
import * as ReactDom from "react-dom";
import { DriverModel } from "../../../common/models/Driver";
import { DriverResponse } from "../../../common/responses/DriverResponse";
import { TeamModel } from "../../../common/models/Team";
import { TeamResponse } from "../../../common/responses/TeamResponse";
import { Selectable, SelectableObject } from "../../../common/models/Selectable";
import { PredictionModel } from "../../../common/models/Prediction";
import { PredictionResponse } from "../../../common/responses/PredictionResponse";
import { SelectBox, SelectOption } from "../../../react-select-component/SelectBox";
import { FormControl, Well, FormGroup, Row, Col } from "react-bootstrap";
import TextField from "material-ui/TextField";
import Paper from "material-ui/Paper";
import Subheader from "material-ui/Subheader";
import Divider from "material-ui/Divider";
import MenuItem from "material-ui/MenuItem";
import SelectField from "material-ui/SelectField";
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
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
    points: number;
    selected: string;
}

export class PredictionComponent extends React.Component<PredictionProps, PredictionState>{
    /**
     *
     */
    constructor(props: PredictionProps) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.handleRequestSnackbarClose = this.handleRequestSnackbarClose.bind(this);
        let points: number = this.props.prediction.predictionResponse.value;
        if (this.props.prediction.predictionResponse.userPick) {
            const picked = this.props.prediction.choices.filter(c => c.key === this.props.prediction.predictionResponse.userPick)[0];
            if (picked) {
                points = points * picked.multiplier;
            }
        }
        this.state = {
            validationState: null,
            snackbarOpen: false,
            snackbarText: "",
            points: points,
            selected: this.props.prediction.json.userPick || "not-app"
        };
    }

    onChange(event: React.ChangeEvent<any>, index, value) {
        //const value = event.target.value !== "not-app" ? event.target.value : null;
        this.props.prediction.predictionResponse.userPick = value;
        const selectedObject = this.props.prediction.choices.filter((s) => { return s.key == value; })[0];
        let currentPoints = 0;
        if (selectedObject) {
            currentPoints = this.props.prediction.predictionResponse.value * selectedObject.multiplier;
        }
        this.props.save(this.props.prediction).then(success => {
            this.setState({
                validationState: success ? "success" : "error",
                snackbarOpen: true,
                snackbarText: success ? "Pick saved successfully" : "Error saving pick. Try again.",
                selected: value,
                points: currentPoints
            });
            setTimeout(() => {
                this.setState({ validationState: null });
            }, 1000);
        });
    }

    getOption(selectable: SelectableObject): JSX.Element {
        const display = selectable.display + " - " + selectable.multiplier.toFixed(2);
        return <MenuItem key={selectable.key} value={selectable.key} primaryText={display} />;
    }

    handleRequestSnackbarClose() {
        this.setState({ snackbarOpen: false });
    }

    render() {
        const styles = {
            paper: {
                paddingTop: "0.5em",
                paddingLeft: "1em",
                paddingRight: "1em",
                paddingBottom: "2.5em",
                marginTop: "0.5em"
            },
            divider: {
                marginTop: "1.5em",
                marginBottom: "0.5em"
            },
            button: {
                marginTop: "2em"
            },
            image: {
                width: "100%"
            },
            fields: {
                width: "100%"
            }
        };
        const prediction = this.props.prediction;
        const options: JSX.Element[] = [];
        const placeholder = <MenuItem key={"not-app"} value={"not-app"} primaryText="Make your pick" />;
        options.push(placeholder);
        const userChoices = prediction.predictionResponse.userPick;
        for (const c of this.props.prediction.choices) {
            options.push(this.getOption(c));
        }
        const totalScore = <Well>
            <div className="centered full-width">Total</div>
            <div className="total-score" >{this.state.points}pts</div>
        </Well>
        const formControl = <SelectField autoWidth={true} key={this.props.prediction.json.key} onChange={this.onChange} value={this.state.selected} disabled={!this.props.allowedPrediction} style={styles.fields}  >{options}</SelectField>;
        return (
            <div>
                <Well bsSize="small">
                    <h3>{prediction.json.title}</h3>
                    <h4>{prediction.json.description}</h4>
                    <Row>
                        <Col sm={10}>
                            {formControl}
                        </Col>
                        <Col sm={2}>
                            {totalScore}
                        </Col>
                    </Row>
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