export type LoginValues = {
  email: string;
  password: string;
};

export type SignupValues = {
  name: string;
  email: string;
  password: string;
};

export type LoginErrors = Partial<Record<keyof LoginValues, string>>;
export type SignupErrors = Partial<Record<keyof SignupValues, string>>;

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export function validateLogin(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {};

  if (!values.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Please enter your password.";
  }

  return errors;
}

export function validateSignup(values: SignupValues): SignupErrors {
  const errors: SignupErrors = {};

  if (!values.name.trim()) {
    errors.name = "Please enter your name.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Please enter a password.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}