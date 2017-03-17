import * as React from "react";
import * as ReactDom from "react-dom";
import { DriverModel, DriverResponse } from "../../../common/models/Driver";
import { TeamModel, TeamResponse } from "../../../common/models/Team";
import { PredictionModel, PredictionResponse } from "../../../common/models/Prediction";
import { SelectBox, SelectOption } from "../../../react-select-component/SelectBox";
import { MenuItem, DropdownButton, Well, SelectCallback } from "react-bootstrap";

export interface PredictionProps {
    prediction: PredictionModel;
}

export interface PredictionState {

}

export class PredictionComponent extends React.Component<PredictionProps, PredictionState>{
    /**
     *
     */
    constructor(props: PredictionProps) {
        super(props);
        this.onDropdownSelect = this.onDropdownSelect.bind(this);
    }

    onDropdownSelect(eventKey) {
        alert(eventKey);
    }

    onSelectionChanged(option: SelectOption) {
        alert(option.display + " - " + option.value);
    }

    getSelectOption(c): SelectOption {
        return c.hasOwnProperty("firstName") ? { display: c["firstName"] + " " + c["lastName"], value: c } : { display: c["name"], value: c }
    }

    getMenuItem(option: DriverResponse | TeamResponse): JSX.Element {
        if ((option as DriverResponse).firstName) {
            const driverOption = option as DriverResponse;
            const selectText = driverOption.firstName + " " + driverOption.lastName;
            return <MenuItem key={driverOption.key} eventKey={driverOption.key} >{selectText}</MenuItem>;
        }
        else {
            const teamOption = option as TeamResponse;
            const selectText = teamOption.name;
            return <MenuItem key={teamOption.key} eventKey={teamOption.key} >{selectText}</MenuItem>;
        }
    }

    render() {
        const prediction = this.props.prediction;
        const menuItems: JSX.Element[] = [];
        for (const c of prediction.json.choices) {
            menuItems.push(this.getMenuItem(c));
        }
        const dropdown = <DropdownButton onSelect={this.onDropdownSelect} id={prediction.json.key} bsSize="large" title="Make your pick">
            {menuItems}
        </DropdownButton>;
        {/*return <div className="prediction-box">
            <h1>{this.props.prediction.json.title}</h1>
            <span>{this.props.prediction.json.description}</span>
            <div>
                <SelectBox isStrings={false} label="Your selection" onOptionChanged={this.onSelectionChanged.bind(this)} options={options} selectMessage="Make Your Pick" strings={[]} />
            </div>
        </div>*/}
        return <Well>
            <h4>{prediction.json.title}</h4>
            <p>{prediction.json.description}</p>
            {dropdown}
        </Well>;

    }
}