'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Joi = require("joi");
exports.authenticateUserSchema = Joi.alternatives().try([
    Joi.object({
        authType: Joi.string().required(),
        auth_token: Joi.string().required()
    })
]);
