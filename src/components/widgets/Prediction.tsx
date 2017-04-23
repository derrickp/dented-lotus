import * as React from "react";
import * as ReactDom from "react-dom";
import { DriverModel } from "../../../common/models/Driver";
<<<<<<< Updated upstream
import { DriverResponse } from "../../../common/responses/DriverResponse";
import { TeamModel } from "../../../common/models/Team";
import { TeamResponse } from "../../../common/responses/TeamResponse";
import { Selectable } from "../../../common/models/Selectable";
=======
import { TeamModel, TeamResponse } from "../../../common/models/Team";
import { Selectable, SelectableObject } from "../../../common/models/Selectable";
>>>>>>> Stashed changes
import { PredictionModel } from "../../../common/models/Prediction";
import { PredictionResponse } from "../../../common/responses/PredictionResponse";
import { DriverResponse } from "../../../common/responses/DriverResponse";
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
    selectableObjects: SelectableObject[];
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
        this.state = {
            validationState: null,
            snackbarOpen: false,
            snackbarText: "",
            selectableObjects: [],
            points: 0,
            selected: this.props.prediction.json.userPick || "not-app"
        };
        this.props.prediction.getSelectable().then((sel) => {
            const current = sel.filter((f) => { return f.key == this.props.prediction.json.userPick; })[0];
            let points = 0;
            if (current) {
                points = current.points * current.multiplier;
            }
            this.setState({
                selectableObjects: sel,
                points: points
            });
        });
    }

    onChange(event: React.ChangeEvent<any>, index, value) {
        //const value = event.target.value !== "not-app" ? event.target.value : null;
        this.props.prediction.predictionResponse.userPick = value;
        const selectedObject = this.state.selectableObjects.filter((s) => { return s.key == value; })[0];
        let currentPoints = 0;
        if (selectedObject) {
            currentPoints = selectedObject.points * selectedObject.multiplier;
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
        for (const c of this.state.selectableObjects) {
            options.push(this.getOption(c));
        }
        const totalScore = <div className="total-score">
            {this.state.points}
        </div>
        const formControl = <SelectField autoWidth={true} key={this.props.prediction.json.key} onChange={this.onChange} value={this.state.selected} disabled={!this.props.allowedPrediction} style={styles.fields} floatingLabelText={this.props.prediction.json.title} >{options}</SelectField>;
        /*<FormGroup key={prediction.json.key} validationState={this.state.validationState} bsSize="large">
            <FormControl disabled={!this.props.allowedPrediction} defaultValue={userChoices} onChange={this.onChange} id={prediction.json.key} componentClass="select" placeholder="Make your pick">
                {options}
            </FormControl>
        </FormGroup>;*/
        return (
            <div>
                <Well bsSize="small">
                    <h3>{prediction.json.title} - {prediction.json.value}pts</h3>
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