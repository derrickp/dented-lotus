import * as React from "react";

import { Grid, Row, Col, Form, FormGroup, FormControl, ControlLabel, Image, ButtonToolbar, Button, Panel, Label } from "react-bootstrap";

import { User } from "../../../common/models/User";
import { DriverModel } from "../../../common/models/Driver";
import { TeamModel } from "../../../common/models/Team";

export interface ProfileProps {
    user: User;
    thisUser: User;
    drivers: DriverModel[];
    teams: TeamModel[];
}

export interface ProfileState {
    displayName: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
    saving: boolean;
    errorMessage: string;
}

export class Profile extends React.Component<ProfileProps, ProfileState> {

    constructor(props: ProfileProps) {
        super(props);
        this.state = {
            displayName: props.user.displayName,
            firstName: props.user.firstName,
            lastName: props.user.lastName,
            imageUrl: props.user.imageUrl,
            saving: false,
            errorMessage: ""
        };
        this.handleDisplayNameChange = this.handleDisplayNameChange.bind(this);
        this.handleFirstNameChange = this.handleFirstNameChange.bind(this);
        this.handleLastNameChange = this.handleLastNameChange.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
        this.save = this.save.bind(this);
    }

    save() {
        const user = this.props.user;
        user.displayName = this.state.displayName;
        user.firstName = this.state.firstName;
        user.lastName = this.state.lastName;
        if (user.imageUrl !== this.state.imageUrl) {
            user.imageUrl = this.state.imageUrl;
            user.usingDefaultImage = false;
        }
        this.setState({ saving: true, errorMessage: "" });
        user.save().then(() => {
            this.setState({ saving: false });
        }).catch((error: Error) => {
            this.setState({ saving: false, errorMessage: error.message });
        });
    }

    handleDisplayNameChange(event: React.ChangeEvent<any>) {
        this.setState({ displayName: event.target.value });
    }

    handleFirstNameChange(event: React.ChangeEvent<any>) {
        this.setState({ firstName: event.target.value });
    }

    handleLastNameChange(event: React.ChangeEvent<any>) {
        this.setState({ lastName: event.target.value });
    }

    handleImageChange(event: React.ChangeEvent<any>) {
        const target: HTMLInputElement = event.target;
        const file = target.files[0];
        if (file) {
            getAsDataUrl(file).then(url => {
                this.setState({ imageUrl: url });
            })
        }
    }

    render() {
        let disabled: boolean = true;
        let showEmail: boolean = false;
        if (this.props.thisUser.key === this.props.user.key) {
            disabled = false;
            showEmail = true;
        }

        return (
            <Grid>
                <Row>
                    <Col xs={10} md={6}>
                        <Image src={this.state.imageUrl} responsive={true}></Image>
                        <FormControl type={"file"} onChange={this.handleImageChange} accept={"image/*"}></FormControl>
                    </Col>
                    <Col xs={10} md={6}>
                        <Panel>
                            <Form horizontal>
                                <FormGroup controlId="formHorizontalDisplayName">
                                    <Col componentClass={ControlLabel} sm={2}>Display Name</Col>
                                    <Col sm={10}>
                                        <FormControl disabled={disabled} onChange={this.handleDisplayNameChange} value={this.state.displayName} type="text" placeholder="Display Name" />
                                    </Col>
                                </FormGroup>
                                <FormGroup controlId="formHorizontalFirstName">
                                    <Col componentClass={ControlLabel} sm={2}>First Name</Col>
                                    <Col sm={10}>
                                        <FormControl disabled={disabled} onChange={this.handleFirstNameChange} value={this.state.firstName} type="text" placeholder="First Name" />
                                    </Col>
                                </FormGroup>
                                <FormGroup controlId="formHorizontalLastName">
                                    <Col componentClass={ControlLabel} sm={2}>Last Name</Col>
                                    <Col sm={10}>
                                        <FormControl disabled={disabled} onChange={this.handleLastNameChange} value={this.state.lastName} type="text" placeholder="Last Name" />
                                    </Col>
                                </FormGroup>
                                {showEmail &&
                                    <FormGroup controlId="formHorizontalEmail">
                                        <Col componentClass={ControlLabel} sm={2}>Email</Col>
                                        <Col sm={10}>
                                            <FormControl disabled={true} value={this.props.user.email} type="text" placeholder="Email" />
                                        </Col>
                                    </FormGroup>
                                }
                                {!disabled &&
                                <FormGroup controlId="formHorizontalSave">
                                        { this.state.saving && <Col sm={1}>
                                            <h3 style={{color: "green"}}><Label>Saving</Label></h3>
                                        </Col> }
                                        { this.state.errorMessage && <Col sm={1}>
                                            <h3 style={{color: "red"}}>{this.state.errorMessage}</h3>
                                        </Col> }
                                        <Col sm={10} smOffset={9}>
                                            <Button onClick={this.save} bsSize={"large"} bsStyle={"primary"}>Save</Button>
                                        </Col>
                                    </FormGroup>
                                }
                            </Form>
                        </Panel>
                    </Col>
                </Row>
            </Grid>
        );
    }
}

export function getAsDataUrl(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            resolve(reader.result);
        });
        reader.addEventListener("error", () => {
            reject(reader.error);
        });
        reader.readAsDataURL(file);
    });
}