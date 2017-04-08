import * as React from "react";
import { LoginLogout } from "./widgets/LoginLogout";
import { Pages } from "./Pages";
import { User } from "../../common/models/User";
import { UserComponent } from "./User";
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, DropdownButton } from "react-bootstrap";

export interface BannerProps {
    title: string;
    changePage: (page: string) => void;
    doGoogleLogin: () => Promise<void>;
    doFacebookLogin: () => Promise<void>;
    logout: () => void;
    loggedIn: boolean;
    user: User;
};

export interface BannerState {
    showLogin: boolean;
}

export class Banner extends React.Component<BannerProps, BannerState>{
    /**
     *
     */
    constructor(props: BannerProps) {
        super(props);
        this.state = {
            showLogin: false
        }
        this.clickHome = this.clickHome.bind(this);
        this.clickBlogs = this.clickBlogs.bind(this);
        this.clickProfile = this.clickProfile.bind(this);
        this.clickRaces = this.clickRaces.bind(this);
        this.clickDrivers = this.clickDrivers.bind(this);
        this.clickTracks = this.clickTracks.bind(this);
        this.clickLogout = this.clickLogout.bind(this);
        this.clickLogin = this.clickLogin.bind(this);
        this.onLogin = this.onLogin.bind(this);
        this.clickPredictionsAdmin = this.clickPredictionsAdmin.bind(this);
    }

    clickHome() {
        this.props.changePage(Pages.HOME);
        event.preventDefault();
    }

    clickBlogs(event: React.MouseEvent<NavItem>) {
        this.props.changePage(Pages.BLOGS);
        event.preventDefault();
    }

    clickRaces(event: React.MouseEvent<NavItem>) {
        this.props.changePage(Pages.ALL_RACES);
        event.preventDefault();
    }

    clickProfile(event: React.MouseEvent<NavItem>) {
        this.props.changePage(Pages.PROFILE);
        event.preventDefault();
    }

    clickDrivers() {
        this.props.changePage(Pages.DRIVERS);
        event.preventDefault();
    }

    clickTracks() {
        this.props.changePage(Pages.TRACKS);
        event.preventDefault();
    }

    clickLogout(event: React.MouseEvent<NavItem>) {
        this.props.logout();
        event.preventDefault();
    }

    clickLogin(event: React.MouseEvent<NavItem>) {
        this.setState({ showLogin: true });
        event.preventDefault();
    }

    clickPredictionsAdmin(event: React.MouseEvent<NavItem>) {
        this.props.changePage(Pages.PREDICTIONS_ADMIN);
        event.preventDefault();
    }

    onLogin() {
        this.setState({ showLogin: false });
    }

    render() {
        const navItems: JSX.Element[] = [];
        const navRightItems: JSX.Element[] = [];
        // We'll always allow blogs to be visible
        navItems.push(<NavItem key={"home"} eventKey={"home"} onClick={this.clickHome} href="#home">Home</NavItem>);
        navItems.push(<NavItem key={"blogs"} eventKey={"blogs"} onClick={this.clickBlogs} href="#blogs">Blogs</NavItem>);
        navItems.push(<NavItem key={"drivers"} eventKey={"drivers"} onClick={this.clickDrivers} >Drivers</NavItem>);
        navItems.push(<NavItem key={"tracks"} eventKey={"tracks"} onClick={this.clickTracks}>Tracks</NavItem>);
        // If the user is logged in, they get more options
        if (this.props.loggedIn) {
            navItems.push(<NavItem key={"races"} eventKey={"races"} onClick={this.clickRaces} href="#races">Races</NavItem>);
            if (this.props.user.isAdmin) {
                navItems.push(<NavItem key={"predictions-admin"} eventKey={"predictions-admin"} onClick={this.clickPredictionsAdmin}>Predictions</NavItem>)
            }
            navRightItems.push(<NavDropdown key={"user-dropdown"} eventKey={"user-dropdown"} title={this.props.user.displayName} id="basic-nav-dropdown">
                <MenuItem key={"profile"} eventKey={"profile"} onClick={this.clickProfile} >Profile</MenuItem>
                <MenuItem key={"logout"} eventKey={"logout"} onClick={this.clickLogout}>Logout</MenuItem>
            </NavDropdown>);
        }
        else {
            navRightItems.push(<NavItem key={"login"} eventKey={"login"} onClick={this.clickLogin} >Login</NavItem>);
        }

        return (
            <div>
                <Navbar inverse={true} collapseOnSelect={true}>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <a onClick={this.clickHome}>{this.props.title}</a>
                        </Navbar.Brand>
                        <Navbar.Toggle />
                    </Navbar.Header>
                    <Navbar.Collapse>
                        <Nav>
                            {navItems}
                        </Nav>
                        <Nav pullRight={true}>
                            {navRightItems}
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <LoginLogout key={"loginlogout"} show={this.state.showLogin} onLogin={this.onLogin} doGoogleLogin={this.props.doGoogleLogin} doFacebookLogin={this.props.doFacebookLogin} loggedIn={this.props.loggedIn} />
            </div>
        );
    }
}