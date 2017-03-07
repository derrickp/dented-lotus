
import * as React from "react";
import { StateManager } from "../../StateManager";
import { PropsBase } from "../../utilities/ComponentUtilities";
import { Promise } from "bluebird";
import { User, FacebookUser, GoogleUser } from "../../../common/models/User";
import { FacebookLogin } from 'react-facebook-login';
import Rodal from "rodal";
import { Modal } from "./Modal";
import {Pages} from "../Pages";
import {MenuComponent}  from "../Menu";
import { GoogleLogin } from "../Auth/GoogleLogin";

export interface LoginLogoutProps extends PropsBase {
    onPageChange: (page: string) => void;
    completeGoogleLogin: (args) => void;
    logout: () => void;
    loggedIn: boolean;
}
export class LoginLogout extends React.Component<LoginLogoutProps, any>{
    completeGoogleLogin: (args) => void;
    stateManager: StateManager;
    /**
     *
     */
    constructor(props: LoginLogoutProps) {
        super(props);
        this.stateManager = props.stateManager;  
        this.state = { modalVisible: false, sidebarOpen: false };
        this.completeGoogleLogin = props.completeGoogleLogin;
    }

    showLoginModal() {
        this.setState({ modalVisible: true });
    }

    hideLoginModal() { 
        this.setState({ modalVisible: false });
    }

    facebookSignedIn(args) {
        alert("facebookLoggedIn");
        this.hideLoginModal();
    }

    onMenuClicked(){
        let next= !this.state.sidebarOpen;
        this.setState({sidebarOpen: next});
    }

    onLogin() {
        this.hideLoginModal();
    }

    render() {
        let sidebarContent = "<b>Sidebar content</b>";
        if (this.props.loggedIn) {
            return <div className="logout" onClick={this.onMenuClicked.bind(this)}>
                <MenuComponent onPageChange={this.props.onPageChange} stateManager={this.stateManager} isOpen={this.state.sidebarOpen} onLogout={this.props.logout}/>
            </div>
        } else {
            let content = <div className="login-modal">
                <div className="modal-header">Log In</div>
                <GoogleLogin loggedIn={this.props.loggedIn} completeGoogleLogin={this.completeGoogleLogin} stateManager={this.stateManager} onLogin={this.onLogin.bind(this)} />
                {/*<FacebookLogin appId="1088597931155576" autoLoad={true} fields="name,email,picture" callback={(a) => { }} cssClass="my-facebook-button-class" icon="fa-facebook" />*/}
                {/*<div className="fb-login-button" data-max-rows="1" data-size="large" data-show-faces="false" data-auto-logout-link="false" data-onsuccess={this.facebookSignedIn.bind(this)}></div>*/}
            </div>
            return <div className="login"><span onClick={this.showLoginModal.bind(this)}>Log In</span>
                <Modal content={content} isOpen={this.state.modalVisible} stateManager={this.stateManager} onClose={this.hideLoginModal.bind(this)} />
            </div>
        }
    }
}
