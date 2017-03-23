
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
    doGoogleLogin: () => Promise<void>;
    doFacebookLogin: () => Promise<void>;
    logout: () => void;
    signUp: (type: string) => void;
    loggedIn: boolean;
    user: User;
}

export interface LoginLogoutState {
    sidebarOpen: boolean;
    modalVisible: boolean;
    loading: boolean;
}

export class LoginLogout extends React.Component<LoginLogoutProps, LoginLogoutState>{
    /**
     *
     */
    constructor(props: LoginLogoutProps) {
        super(props);
        this.state = { modalVisible: false, sidebarOpen: false, loading: false };
        this.onLogin = this.onLogin.bind(this);
        this.hideLoginModal = this.hideLoginModal.bind(this);
        this.googleLogin = this.googleLogin.bind(this);
        this.fbLogin = this.fbLogin.bind(this);
    }

    googleLogin() {
        this.setState({loading: true});
        this.props.doGoogleLogin().then(() => {
            this.setState({ loading: false });
            this.hideLoginModal();
        });
    }

    fbLogin() {
        this.setState({ loading: true });
        this.props.doFacebookLogin().then(() => {
            this.setState({ loading: false });
            this.hideLoginModal();
        });
    }

    showLoginModal() {
        this.setState({ modalVisible: true });
    }

    hideLoginModal() {
        this.setState({ modalVisible: false });
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
        const googleLogin = this.props.doGoogleLogin ? this.googleLogin : null;
        const fbLogin = this.props.doFacebookLogin ? this.fbLogin : null;
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
                            <Modal.Title>Log In or Sign Up With</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <GoogleLogin login={googleLogin} loggedIn={this.props.loggedIn} />
                            <FacebookLogin loggedIn={this.props.loggedIn} login={fbLogin}></FacebookLogin>
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
