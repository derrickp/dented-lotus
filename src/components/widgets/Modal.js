"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var rodal_1 = require("rodal");
var React = require("react");
var Modal = (function (_super) {
    __extends(Modal, _super);
    /**
     *
     */
    function Modal(props) {
        var _this = _super.call(this, props) || this;
        _this.onClose = props.onClose;
        return _this;
    }
    Modal.prototype.render = function () {
        return React.createElement(rodal_1.default, { visible: this.props.isOpen, animation: "zoom", onClose: this.onClose.bind(this) }, this.props.content);
    };
    return Modal;
}(React.Component));
exports.Modal = Modal;
