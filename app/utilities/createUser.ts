'use strict';

import { string, object } from "joi";

export const createUserSchema = object({
  display: string().alphanum().min(2).max(30),
  email: string().email().required(),
  password: string().required(),
  firstName: string().alphanum(),
  lastName: string().alphanum()
});