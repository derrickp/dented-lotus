"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Banner_1 = require("./Banner");
var BlogComponent_1 = require("./BlogComponent");
var RaceCountdown_1 = require("./widgets/RaceCountdown");
var Pages_1 = require("./Pages");
var PageUtilities_1 = require("../utilities/PageUtilities");
var User_1 = require("../../common/models/User");
var DentedLotus = (function (_super) {
    __extends(DentedLotus, _super);
    /**
     *
     */
    function DentedLotus(props) {
        var _this = _super.call(this, props) || this;
        _this.sidebarStyle = {
            root: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden',
            },
            sidebar: {
                zIndex: 2,
                position: 'absolute',
                top: 0,
                bottom: 0,
                transition: 'transform .3s ease-out',
                WebkitTransition: '-webkit-transform .3s ease-out',
                willChange: 'transform',
                overflowY: 'auto',
            },
            content: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'auto',
                transition: 'left .3s ease-out, right .3s ease-out',
            },
            overlay: {
                zIndex: 1,
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0,
                visibility: 'hidden',
                transition: 'opacity .3s ease-out',
                backgroundColor: 'rgba(0,0,0,.3)',
            },
            dragHandle: {
                zIndex: 1,
                position: 'fixed',
                top: 0,
                bottom: 0,
            },
        };
        var parameters = PageUtilities_1.getUrlParameters();
        _this.stateManager = props.stateManager;
        _this.state = { loggedIn: false, race: Promise.resolve(null), parameters: parameters, sidebarOpen: false };
        window.addEventListener("google-login-success", function (args) {
            _this.onGoogleLogin(args.detail);
        });
        return _this;
    }
    DentedLotus.prototype.onGoogleLogin = function (args) {
        // this.hide();
        this.stateManager.setUser(new User_1.GoogleUser(args));
        this.setState({ loggedIn: this.stateManager.isLoggedIn });
        // this.setState({ loggedIn: true });
    };
    DentedLotus.prototype.onMenuClicked = function () {
        this.setState({ sidebarOpen: true });
    };
    DentedLotus.prototype.onSetSidebarOpen = function () {
        this.setState({ sidebarOpen: true });
    };
    DentedLotus.prototype.launchRacePicks = function () {
        var parameters = this.state.parameters;
        parameters.page = Pages_1.Pages.RACE;
        this.setState({ parameters: parameters, race: this.stateManager.getNextRace() });
    };
    DentedLotus.prototype.onPageChange = function (page) {
        var parameters = this.state.parameters;
        parameters.page = page;
        this.setState({ parameters: parameters });
    };
    DentedLotus.prototype.getCurrentView = function () {
        switch (this.state.parameters.page) {
            case Pages_1.Pages.RACE:
                return React.createElement(Pages_1.RacePage, { race: this.state.race, small: false });
            case Pages_1.Pages.USER:
                return React.createElement("div", null, "User!!!!");
            case Pages_1.Pages.ALL_RACES:
                return React.createElement(Pages_1.AllRaces, { races: this.stateManager.races });
            case Pages_1.Pages.TRACKS:
                return React.createElement(Pages_1.Tracks, { tracks: this.stateManager.tracks });
            case Pages_1.Pages.DRIVERS:
                return React.createElement(Pages_1.Drivers, { drivers: this.stateManager.drivers });
            default:
                return this.getHomePage();
        }
    };
    DentedLotus.prototype.getHomePage = function () {
        return React.createElement("div", null,
            React.createElement(RaceCountdown_1.RaceCountdown, { onclick: this.launchRacePicks.bind(this), stateManager: this.stateManager, displayName: this.stateManager.nextRace.displayName, cutoffDate: this.stateManager.nextRace.date }),
            React.createElement(BlogComponent_1.BlogComponent, { stateManager: this.stateManager }));
    };
    DentedLotus.prototype.render = function () {
        return React.createElement("div", null,
            React.createElement(Banner_1.Banner, { loggedIn: this.stateManager.isLoggedIn, onGoogleLogin: this.onGoogleLogin.bind(this), onPageChange: this.onPageChange.bind(this), stateManager: this.stateManager, title: "Project Dented Lotus" }),
            React.createElement("div", { className: "wrapper" }, this.getCurrentView()));
    };
    return DentedLotus;
}(React.Component));
exports.DentedLotus = DentedLotus;
