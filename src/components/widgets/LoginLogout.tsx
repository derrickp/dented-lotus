
import * as React from "react";
import { StateManager } from "../../StateManager";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { Promise } from "bluebird";
import { User, FacebookUser, GoogleUser } from "../../models/User";
import {UserComponent} from "../User";
import GoogleLogin from 'react-google-login';
import { GoogleLoginProps, GoogleLoginResponse } from 'react-google-login';
import { FacebookLogin } from 'react-facebook-login';
import Rodal from "rodal";
import { Modal } from "./Modal"
import * as burger from "react-burger-menu";
var Menu = burger.slide;



export interface LoginLogoutProps extends PropsBase {
    onLogin: (User) => void;
    onLogout: () => void;
    onMenuClicked: () => void;
}
export class LoginLogout extends React.Component<LoginLogoutProps, any>{
    onLogin: (User) => void;
    onLogout: () => void;
    onMenuClicked: () => void;
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

    googleSignedIn(args: GoogleLoginResponse) {
        console.log("Ongooglesignedin!");
        this.hide();
        this.onLogin(new GoogleUser(args));
        this.setState({ loggedIn: true });
    }

    facebookSignedIn(args) {
        alert("facebookLoggedIn");
        this.hide();
    }
    loginFailed(args) {

    }

    render() {
        let sidebarContent = "<b>Sidebar content</b>";
        if (this.state.loggedIn) {
            return <div className="logout" onClick={this.onMenuClicked.bind(this)}>
                <Menu width={270} customBurgerIcon={false} pageWrapId={"page-wrap"} isOpen={this.state.sidebarOpen} right>
                    <UserComponent small  stateManager={this.props.stateManager}/>
                    <a id="home" className="menu-item" href="/">Home</a>
                    <a id="about" className="menu-item" href="/about">About</a>
                    <a id="contact" className="menu-item" href="/contact">Contact</a>
                </Menu>
            </div>
        } else {
            let content = <div className="login-modal">
                <div className="modal-header">Header</div>
                <GoogleLogin clientId="1047134015899-kpabbgk5b6bk0arj4b1hecktier9nki7.apps.googleusercontent.com" buttonText="Login" onSuccess={this.googleSignedIn.bind(this)} onFailure={this.loginFailed.bind(this)} />
                {/*<FacebookLogin appId="1088597931155576" autoLoad={true} fields="name,email,picture" callback={(a) => { }} cssClass="my-facebook-button-class" icon="fa-facebook" />*/}
                {/*<div className="fb-login-button" data-max-rows="1" data-size="large" data-show-faces="false" data-auto-logout-link="false" data-onsuccess={this.facebookSignedIn.bind(this)}></div>*/}
            </div>
            return <div className="login"><span onClick={this.login}>Log  In</span>
                <Modal content={content} isOpen={this.state.modalVisible} stateManager={this.stateManager} onClose={this.hide.bind(this)} />
            </div>
        }
    }
}
