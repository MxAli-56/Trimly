
const validateRegistration = (data) => {
  const errors = {};

  if (!data.name.trim()) {
    errors.name = 'Full name is required.';
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!data.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!/^(\+92|0)?3\d{9}$/.test(data.phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Enter a valid Pakistani mobile number.';
  }

  if (!data.role) {
    errors.role = 'Please select an account type.';
  }

  if (data.role === 'SALON_OWNER') {
    if (!data.cnic.trim()) {
      errors.cnic = 'CNIC is required for salon owners.';
    } else if (!/^\d{5}-?\d{7}-?\d{1}$/.test(data.cnic)) {
      errors.cnic = 'Enter a valid 13-digit CNIC.';
    }
  }

  if (!data.password) {
    errors.password = 'Password is required.';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!data.acceptedTerms) {
    errors.acceptedTerms = 'You must accept the terms.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default validateRegistration;
