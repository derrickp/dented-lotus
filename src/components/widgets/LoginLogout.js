"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var User_1 = require("../../models/User");
var User_2 = require("../User");
var react_google_login_1 = require("react-google-login");
var Modal_1 = require("./Modal");
var burger = require("react-burger-menu");
var Menu = burger.slide;
var LoginLogout = (function (_super) {
    __extends(LoginLogout, _super);
    /**
     *
     */
    function LoginLogout(props) {
        var _this = _super.call(this, props) || this;
        _this.stateManager = props.stateManager;
        _this.login = _this.login.bind(_this);
        _this.logout = _this.logout.bind(_this);
        _this.state = { loggedIn: false, modalVisible: false, sidebarOpen: false };
        _this.onLogin = props.onLogin;
        _this.onLogout = props.onLogout;
        _this.onMenuClicked = props.onMenuClicked;
        return _this;
    }
    LoginLogout.prototype.componentDidMount = function () {
        this.setState({ loggedIn: false });
    };
    LoginLogout.prototype.logout = function () {
        this.onLogout();
        this.setState({ loggedIn: false });
    };
    LoginLogout.prototype.login = function () {
        this.setState({ modalVisible: true });
    };
    LoginLogout.prototype.hide = function () {
        this.setState({ modalVisible: false });
    };
    LoginLogout.prototype.googleSignedIn = function (args) {
        console.log("Ongooglesignedin!");
        this.hide();
        this.onLogin(new User_1.GoogleUser(args));
        this.setState({ loggedIn: true });
    };
    LoginLogout.prototype.facebookSignedIn = function (args) {
        alert("facebookLoggedIn");
        this.hide();
    };
    LoginLogout.prototype.loginFailed = function (args) {
    };
    LoginLogout.prototype.render = function () {
        var sidebarContent = "<b>Sidebar content</b>";
        if (this.state.loggedIn) {
            return React.createElement("div", { className: "logout", onClick: this.onMenuClicked.bind(this) },
                React.createElement(Menu, { width: 270, customBurgerIcon: false, pageWrapId: "page-wrap", isOpen: this.state.sidebarOpen, right: true },
                    React.createElement(User_2.UserComponent, { small: true, stateManager: this.props.stateManager }),
                    React.createElement("a", { id: "home", className: "menu-item", href: "/" }, "Home"),
                    React.createElement("a", { id: "about", className: "menu-item", href: "/about" }, "About"),
                    React.createElement("a", { id: "contact", className: "menu-item", href: "/contact" }, "Contact")));
        }
        else {
            var content = React.createElement("div", { className: "login-modal" },
                React.createElement("div", { className: "modal-header" }, "Header"),
                React.createElement(react_google_login_1.default, { clientId: "1047134015899-kpabbgk5b6bk0arj4b1hecktier9nki7.apps.googleusercontent.com", buttonText: "Login", onSuccess: this.googleSignedIn.bind(this), onFailure: this.loginFailed.bind(this) }));
            return React.createElement("div", { className: "login" },
                React.createElement("span", { onClick: this.login }, "Log  In"),
                React.createElement(Modal_1.Modal, { content: content, isOpen: this.state.modalVisible, stateManager: this.stateManager, onClose: this.hide.bind(this) }));
        }
    };
    return LoginLogout;
}(React.Component));
exports.LoginLogout = LoginLogout;
