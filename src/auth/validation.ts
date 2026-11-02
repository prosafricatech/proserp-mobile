import * as yup from 'yup';
import { dictionary } from '../i18n';

// Same rules as live-repo: src/components/signupForm/validation.tsx and
// src/components/forgotPassword/ResetPasswordForm.tsx.
export const PASSWORD_COMPLEXITY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/;
const PHONE = /^\+?[0-9]{10,15}$/;

const su = dictionary.signup.errors;
const rp = dictionary.resetPassword.errors;
const si = dictionary.signin.errors;

export const loginSchema = yup.object({
  email: yup.string().trim().email(si.emailInvalid).required(si.emailRequired),
  password: yup.string().required(si.passwordRequired),
});

export const signupSchema = yup.object({
  name: yup.string().trim().required(su.nameRequired).max(191, su.nameTooLong),
  email: yup.string().trim().email(su.emailInvalid).required(su.emailRequired),
  phone: yup.string().trim().required(su.phoneRequired).matches(PHONE, su.phoneFormat),
  password: yup
    .string()
    .required(su.passwordRequired)
    .matches(PASSWORD_COMPLEXITY, su.passwordComplexity),
  password_confirmation: yup
    .string()
    .required(su.confirmRequired)
    .oneOf([yup.ref('password')], su.mismatch),
});

export const forgotPasswordSchema = yup.object({
  email: yup.string().trim().email(rp.emailInvalid).required(rp.emailRequired),
});

export const resetPasswordSchema = yup.object({
  link: yup.string().trim().required(rp.tokenRequired),
  email: yup.string().trim().email(rp.emailInvalid).required(rp.emailRequired),
  password: yup.string().required(rp.passwordRequired).matches(PASSWORD_COMPLEXITY, rp.complexity),
  password_confirmation: yup
    .string()
    .required(rp.confirmationRequired)
    .oneOf([yup.ref('password')], rp.mismatch),
});

const pr = dictionary.profile;
export const changePasswordSchema = yup.object({
  current_password: yup.string().required(pr.currentRequired),
  password: yup.string().required(rp.passwordRequired).matches(PASSWORD_COMPLEXITY, rp.complexity),
  password_confirmation: yup
    .string()
    .required(rp.confirmationRequired)
    .oneOf([yup.ref('password')], rp.mismatch),
});

export type ChangePasswordValues = yup.InferType<typeof changePasswordSchema>;
export type LoginValues = yup.InferType<typeof loginSchema>;
export type SignupValues = yup.InferType<typeof signupSchema>;
export type ForgotPasswordValues = yup.InferType<typeof forgotPasswordSchema>;
export type ResetPasswordValues = yup.InferType<typeof resetPasswordSchema>;

// The reset email links to the web app (…/reset-password?token=…&email=…), which a phone
// opens in the browser. Until the app handles those links itself (universal links, Hatua 14),
// the user pastes the link — or just the token — and we pull the values out here.
export const parseResetLink = (input: string): { token: string | null; email: string | null } => {
  const value = input.trim();
  if (!value) return { token: null, email: null };
  const queryStart = value.indexOf('?');
  if (queryStart === -1) {
    // A bare token: no spaces, no slashes.
    return /^[^\s/]+$/.test(value) ? { token: value, email: null } : { token: null, email: null };
  }
  const params = new URLSearchParams(value.slice(queryStart + 1).split('#')[0]);
  return { token: params.get('token'), email: params.get('email') };
};
