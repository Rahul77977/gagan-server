const { z } = require("zod");

// Base schema for login
const loginSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address" }),
  password: z.string()
    .min(7, { message: "Password must be at least 7 characters" }),
});

// Extended schema for signup, including additional fields
const signupSchema = loginSchema.extend({
  name: z.string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(255, { message: "Name must not be more than 255 characters" }),
  phone: z.string({ required_error: "Phone is required" })
    .trim()
    .min(10, { message: "Phone must be at least 10 characters" })
    .max(20, { message: "Phone must not be more than 20 characters" }),
  address: z.string({ required_error: "Address is required" })
    .trim()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(255, { message: "Address must not be more than 255 characters" }),
  answer: z.string({ required_error: "Answer is required" })
    .trim()
    .min(3, { message: "Answer must be at least 3 characters" })
    .max(255, { message: "Answer must not be more than 255 characters" }),
});

module.exports = signupSchema;
