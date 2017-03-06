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
var Pages_1 = require("../components/Pages");
var User_1 = require("./User");
var burger = require("react-burger-menu");
var Menu = burger.slide;
var MenuComponent = (function (_super) {
    __extends(MenuComponent, _super);
    /**
     *
     */
    function MenuComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.onPageChange = props.onPageChange;
        _this.onPageChange.bind(_this);
        return _this;
    }
    MenuComponent.prototype.componentDidMount = function () {
    };
    MenuComponent.prototype.render = function () {
        var _this = this;
        if (this.props.stateManager.currentUser.isLoggedIn && this.props.stateManager.currentUser.isAdmin) {
        }
        return React.createElement(Menu, { width: 270, customBurgerIcon: false, pageWrapId: "page-wrap", isOpen: this.props.isOpen, right: true },
            React.createElement(User_1.UserComponent, { small: true, stateManager: this.props.stateManager }),
            React.createElement("a", { id: "home", className: "menu-item", href: "#home", onClick: function () { return _this.onPageChange(Pages_1.Pages.HOME); } }, "Home"),
            React.createElement("a", { id: "races", className: "menu-item", href: "#page=all-races", onClick: function () { return _this.onPageChange(Pages_1.Pages.ALL_RACES); } }, "Races"),
            React.createElement("a", { id: "tracks", className: "menu-item", href: "#page=tracks", onClick: function () { return _this.onPageChange(Pages_1.Pages.TRACKS); } }, "Tracks"),
            React.createElement("a", { id: "drivers", className: "menu-item", href: "#page=drivers", onClick: function () { return _this.onPageChange(Pages_1.Pages.DRIVERS); } }, "Drivers"));
    };
    return MenuComponent;
}(React.Component));
exports.MenuComponent = MenuComponent;
