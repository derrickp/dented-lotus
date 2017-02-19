'use strict';
var Joi = require("joi");
exports.authenticateUserSchema = Joi.alternatives().try([
    Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
]);
