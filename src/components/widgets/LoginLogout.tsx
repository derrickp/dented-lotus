
import * as React from "react";
import { StateManager } from "../../StateManager";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { Promise } from "bluebird";
import { User, FacebookUser, GoogleUser } from "../../../common/models/User";
import { FacebookLogin } from 'react-facebook-login';
import Rodal from "rodal";
import { Modal } from "./Modal"
import {MenuComponent}  from "../Menu"; 

export interface LoginLogoutProps extends PropsBase {
    onLogin: (User) => void;
    onLogout: () => void; 
    onPageChange: (page: string) => void;
    onGoogleLogin: (args) => void;
    loggedIn: boolean;
}
export class LoginLogout extends React.Component<LoginLogoutProps, any>{
    onLogin: (User) => void;
    onLogout: () => void; 
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

    onMenuClicked(){
        let next= !this.state.sidebarOpen;
        this.setState({sidebarOpen: next});
    }

    render() {
        
        let sidebarContent = "<b>Sidebar content</b>";
        if (this.props.loggedIn) {
            return <div className="logout" onClick={this.onMenuClicked.bind(this)}>
                <MenuComponent onPageChange={this.onPageChange.bind(this)} stateManager={this.stateManager} isOpen={this.state.sidebarOpen}/>
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
