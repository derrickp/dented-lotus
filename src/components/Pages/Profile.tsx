import * as React from "react";

import { Grid, Row, Col } from "react-bootstrap";
import TextField from "material-ui/TextField";
import Paper from "material-ui/Paper";
import Subheader from "material-ui/Subheader";
import Divider from "material-ui/Divider";
import MenuItem from "material-ui/MenuItem";
import SelectField from "material-ui/SelectField";
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
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
    snackTimeout: number;
    snackOpen: boolean;
    snackMessage: string;
    faveDriver: string;
    faveTeam: string;
}

export class Profile extends React.Component<ProfileProps, ProfileState> {

    constructor(props: ProfileProps) {
        super(props);
        this.state = {
            displayName: props.user.displayName,
            firstName: props.user.firstName,
            lastName: props.user.lastName,
            imageUrl: props.user.imageUrl,
            snackTimeout: null,
            snackOpen: false,
            snackMessage: "",
            faveDriver: props.user.faveDriver,
            faveTeam: props.user.faveTeam
        };
        this.handleDisplayNameChange = this.handleDisplayNameChange.bind(this);
        this.handleFirstNameChange = this.handleFirstNameChange.bind(this);
        this.handleLastNameChange = this.handleLastNameChange.bind(this);
        this.handleFavouriteDriverChange = this.handleFavouriteDriverChange.bind(this);
        this.handleFavouriteTeamChange = this.handleFavouriteTeamChange.bind(this);
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
        user.faveDriver = this.state.faveDriver;
        user.faveTeam = this.state.faveTeam;
        this.setState({ snackOpen: true, snackTimeout: 2000, snackMessage: "Saving info" });
        user.save().then(() => {
            this.setState({ snackTimeout: 2000, snackMessage: "Save complete" });
        }).catch((error: Error) => {
            this.setState({ snackMessage: error.message });
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

    handleFavouriteDriverChange(event, index, value) {
        this.setState({ faveDriver: value });
    }

    handleFavouriteTeamChange(event, index, value) {
        this.setState({ faveTeam: value });
    }

    handleRequestSnackClose() {
        this.setState({ snackOpen: false });
    }

    render() {
        let disabled: boolean = true;
        let showEmail: boolean = false;

        if (this.props.thisUser.key === this.props.user.key) {
            disabled = false;
            showEmail = true;
        }
        const driverItems: JSX.Element[] = [];
        driverItems.push(<MenuItem key="null-driver" value={null} primaryText={""}></MenuItem>);
        for (const driver of this.props.drivers) {
            driverItems.push(<MenuItem key={driver.key} value={driver.key} primaryText={driver.display}></MenuItem>);
        }

        const teamItems: JSX.Element[] = [];
        teamItems.push(<MenuItem key="null-team" value={null} primaryText={""}></MenuItem>);
        for (const team of this.props.teams) {
            teamItems.push(<MenuItem key={team.key} value={team.key} primaryText={team.display}></MenuItem>);
        }

        const styles = {
            paper: {
                paddingTop: "0.5em",
                paddingLeft: "5em",
                paddingRight: "5em",
                paddingBottom: "2.5em",
                marginTop: "0.5em"
            },
            divider: {
                marginTop: "1.5em",
                marginBottom: "0.5em"
            },
            button: {
                marginTop: "2em"
            }
        };

        return (
            <div>
                <Grid>
                    <Row>
                        <Col xs={10} md={6}>
                            <img src={this.state.imageUrl} ></img>
                            <br />
                            { !disabled && <input style={styles.button} accept={"image/*"} onChange={this.handleImageChange} type="file" /> }
                        </Col>
                        <Col xs={10} md={6}>
                            <Paper style={styles.paper}>
                                <Subheader>Basic Info</Subheader>
                                <TextField
                                    hintText={"Display Name"}
                                    floatingLabelText={"Display Name"}
                                    onChange={this.handleDisplayNameChange}
                                    value={this.state.displayName}
                                    disabled={disabled}>
                                </TextField>
                                <br />
                                <TextField
                                    hintText={"First Name"}
                                    floatingLabelText={"First Name"}
                                    onChange={this.handleFirstNameChange}
                                    value={this.state.firstName}
                                    disabled={disabled}>
                                </TextField>
                                <br />
                                <TextField
                                    hintText={"Last Name"}
                                    floatingLabelText={"Last Name"}
                                    onChange={this.handleLastNameChange}
                                    value={this.state.lastName}
                                    disabled={disabled}>
                                </TextField>
                                <br />
                                {showEmail && <TextField
                                    hintText={"Email"}
                                    floatingLabelText={"Email"}
                                    disabled={true}
                                    value={this.props.user.email}>
                                </TextField>}
                                <br />
                                <Divider style={styles.divider} />
                                <Subheader>Favourites</Subheader>
                                <SelectField
                                    floatingLabelText={"Favourite Driver"}
                                    onChange={this.handleFavouriteDriverChange}
                                    value={this.state.faveDriver}
                                    disabled={disabled}>
                                    {driverItems}
                                </SelectField>
                                <br />
                                <SelectField
                                    floatingLabelText={"Favourite Team"}
                                    onChange={this.handleFavouriteTeamChange}
                                    value={this.state.faveTeam}
                                    disabled={disabled}>
                                    {teamItems}
                                </SelectField>
                                <br />
                                {!disabled && <RaisedButton onClick={this.save} label="Save" primary={true} style={styles.button} />}
                            </Paper>
                        </Col>
                    </Row>
                </Grid>
                <Snackbar
                open={this.state.snackOpen}
                message={this.state.snackMessage}
                autoHideDuration={this.state.snackTimeout}>
                </Snackbar>
            </div>
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