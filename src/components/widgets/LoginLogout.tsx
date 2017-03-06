
import * as React from "react";
import { StateManager } from "../../StateManager";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { Promise } from "bluebird";
import { User, FacebookUser, GoogleUser } from "../../models/User";
import {UserComponent} from "../User";
import { FacebookLogin } from 'react-facebook-login';
import Rodal from "rodal";
import { Modal } from "./Modal"
import * as burger from "react-burger-menu";
var Menu = burger.slide;

export interface LoginLogoutProps extends PropsBase {
    onLogin: (User) => void;
    onLogout: () => void;
    onMenuClicked: () => void;
    onPageChange: (page: string) => void;
    onGoogleLogin: (args) => void;
    loggedIn: boolean;
}
export class LoginLogout extends React.Component<LoginLogoutProps, any>{
    onLogin: (User) => void;
    onLogout: () => void;
    onMenuClicked: () => void;
    onPageChange: (page: string) => void;
    onGoogleLogin: (args) => void;
    stateManager: StateManager;
    /**
     *
     */
    constructor(props: LoginLogoutProps) {
        super(props);
        this.stateManager = props.stateManager;
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.state = { loggedIn: false, modalVisible: false, sidebarOpen: false };
        this.onLogin = props.onLogin;
        this.onLogout = props.onLogout;
        this.onMenuClicked = props.onMenuClicked;
        this.onPageChange = props.onPageChange;
        this.onGoogleLogin = props.onGoogleLogin;
    }


    componentDidMount() {
        this.setState({ loggedIn: false });
    }
    logout() {
        this.onLogout();
        this.setState({ loggedIn: false });
    }
    login() {
        this.setState({ modalVisible: true });
    }

    hide() { 
        this.setState({ modalVisible: false });
    }

    googleSignedIn() {
        this.hide();
        // this.onGoogleLogin(args);
    }

    facebookSignedIn(args) {
        alert("facebookLoggedIn");
        this.hide();
    }
    loginFailed(args) {

    }

    render() {
        
        let sidebarContent = "<b>Sidebar content</b>";
        if (this.props.loggedIn) {
            return <div className="logout" onClick={this.onMenuClicked.bind(this)}>
                <Menu width={270} customBurgerIcon={false} pageWrapId={"page-wrap"} isOpen={this.state.sidebarOpen} right>
                    <UserComponent small  stateManager={this.props.stateManager}/>
                    <a id="home" className="menu-item" href="#home" onClick={() => this.onPageChange("home")}>Home</a>
                    <a id="races" className="menu-item" href="#page=all-races" onClick={() => this.onPageChange("all-races")}>Races</a>
                    <a id="tracks" className="menu-item" href="#page=tracks" onClick={() => this.onPageChange("tracks")}>Tracks</a>
                    <a id="about" className="menu-item" href="#about" onClick={() => this.onPageChange("about")}>About</a>
                    <a id="contact" className="menu-item" href="#contact" onClick={() => this.onPageChange("contact")}>Contact</a>
                </Menu>
            </div>
        } else {
            let content = <div className="login-modal">
                <div className="modal-header">Log In</div>
                <div className="g-signin2" data-onsuccess="onGoogleSignIn"></div>
                {/*<FacebookLogin appId="1088597931155576" autoLoad={true} fields="name,email,picture" callback={(a) => { }} cssClass="my-facebook-button-class" icon="fa-facebook" />*/}
                {/*<div className="fb-login-button" data-max-rows="1" data-size="large" data-show-faces="false" data-auto-logout-link="false" data-onsuccess={this.facebookSignedIn.bind(this)}></div>*/}
            </div>
            return <div className="login"><span onClick={this.login}>Log In</span>
                <Modal content={content} isOpen={this.state.modalVisible} stateManager={this.stateManager} onClose={this.hide.bind(this)} />
            </div>
        }
    }
}
