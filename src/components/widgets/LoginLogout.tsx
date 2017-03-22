
import * as React from "react";
import { User, FacebookUser, GoogleUser } from "../../../common/models/User";
import Rodal from "rodal";
import { Pages } from "../Pages";
import { MenuComponent } from "../Menu";
import { GoogleLogin } from "../Auth/GoogleLogin";
import { FacebookLogin } from "../Auth/FacebookLogin";
import { Modal, Button } from "react-bootstrap";

export interface LoginLogoutProps {
    onPageChange: (page: string) => void;
    completeGoogleLogin: (args) => void;
    completeFacebookLogin: (args) => void;
    logout: () => void;
    signUp: (type: string) => void;
    loggedIn: boolean;
    user: User;
}

export interface LoginLogoutState {
    sidebarOpen: boolean;
    modalVisible: boolean;
}

export class LoginLogout extends React.Component<LoginLogoutProps, LoginLogoutState>{
    completeGoogleLogin: (args) => void;
    /**
     *
     */
    constructor(props: LoginLogoutProps) {
        super(props);
        this.state = { modalVisible: false, sidebarOpen: false };
        this.completeGoogleLogin = props.completeGoogleLogin;
        this.onLogin = this.onLogin.bind(this);
        this.hideLoginModal = this.hideLoginModal.bind(this);
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

    onMenuClicked() {
        let next = !this.state.sidebarOpen;
        this.setState({ sidebarOpen: next });
    }

    onLogin() {
        this.hideLoginModal();
    }

    onSignUp(type: string) {
        this.hideLoginModal();
        this.props.signUp(type);
    }

    render() {
        let sidebarContent = "<b>Sidebar content</b>";
        if (this.props.loggedIn) {
            return <div className="logout" onClick={this.onMenuClicked.bind(this)}>
                <MenuComponent user={this.props.user} onPageChange={this.props.onPageChange} isOpen={this.state.sidebarOpen} onLogout={this.props.logout} />
            </div>
        } else {
            return (
                <div className="login">
                    <span onClick={this.showLoginModal.bind(this)}>Log In / Sign Up</span>
                    <Modal show={this.state.modalVisible} onHide={this.hideLoginModal} >
                        <Modal.Header closeButton={true}>
                            <Modal.Title>Sign In</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <GoogleLogin loggedIn={this.props.loggedIn} completeGoogleLogin={this.completeGoogleLogin} onLogin={this.onLogin} />
                            <FacebookLogin loggedIn={this.props.loggedIn} completeFacebookLogin={this.props.completeFacebookLogin} onLogin={this.onLogin}></FacebookLogin>
                            <div>or Sign Up</div>
                            <button id="signupBtn" onClick={() => { this.onSignUp("google"); }}>
                                <span className="signup-icon"></span>
                                <span className="signup-buttonText">Dented Lotus</span>
                            </button>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.hideLoginModal}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            );
        }
    }
}
