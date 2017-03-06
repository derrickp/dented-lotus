import * as React from "react";
import * as ReactDOM from "react-dom";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { DriverModel } from "../../../common/models/DriverModel";
import { Form, Input } from "formsy-react-components";

export interface DriverProps {
    driver: DriverModel;
    small: boolean;
}

export interface DriverState {
    isEditing: boolean;
}

export class DriverComponent extends React.Component<DriverProps, DriverState> {

    driver: DriverModel;

    /**
     *
     */
    constructor(props: DriverProps) {
        super(props);
        this.driver = props.driver
        this.state = { isEditing: false };

    }

    editClicked(): void {
        this.setState({ isEditing: true });
    }

    closeEdit():void{
        this.setState({ isEditing: false });
    }

    onValueChanged(name:string,value:any){

    }

    render() {
        let content;
        if (this.state.isEditing) {
            content = <EditDriver driver={this.driver} onEditClicked={this.editClicked.bind(this)} onCloseEdit={this.closeEdit.bind(this)} onValueChanged={this.onValueChanged.bind(this)}/>
        } else {
            content = <DisplayDriver driver={this.driver} onEditClicked={this.editClicked.bind(this)} onCloseEdit={this.closeEdit.bind(this)} onValueChanged={this.onValueChanged.bind(this)}/>
        }

        return content;
    }
}


interface EditDriverProps {
    driver: DriverModel;
    onEditClicked: () => void;
    onCloseEdit: () => void;
    onValueChanged:(name:string,value:any)=>void;
}
function EditDriver(props: EditDriverProps) {
    return <Form onSubmit={(data) => { props.driver.update(data) }}>
        <Input layout="vertical" type="text" value={props.driver.firstName} onChange={(name, s) => { props.driver[name] = s; }} name="firstName" label="First Name:" />
        <Input layout="vertical" type="text" value={props.driver.lastName} onChange={(name, s) => { props.driver[name] = s; }} name="lastName" label="Last Name:" />
        <Input layout="vertical" type="text" value={props.driver.nationality} onChange={(name, s) => { props.driver[name] = s; }} name="nationality" label="Nationality:" />
        <Input layout="vertical" type="number" value={props.driver.points} onChange={(name, s) => { props.driver[name] = s; }} name="points" label="Points:" />
        <Input layout="vertical" type="text" value={props.driver.wins} onChange={(name, s) => { props.driver[name] = s; }} name="wins" label="Wins:" />
        <button onClick={props.onCloseEdit}>Close</button>
    </Form>
}

function DisplayDriver(props: EditDriverProps) {
    return <div className="driver">
        <label htmlFor="form-field-1">First Name:</label><span id="form-field-1">{props.driver.firstName}</span><br />
        <label htmlFor="form-field-2">Last Name:</label><span id="form-field-2">{props.driver.lastName}</span><br />
        <label htmlFor="form-field-3">Nationality:</label><span id="form-field-3">{props.driver.nationality}</span><br />
        <label htmlFor="form-field-4">Points:</label><span id="form-field-4">{props.driver.points}</span><br />
        <label htmlFor="form-field-5">Wins:</label><span id="form-field-5">{props.driver.wins}</span><br />
        <button onClick={props.onEditClicked}>Edit</button>
    </div>
}