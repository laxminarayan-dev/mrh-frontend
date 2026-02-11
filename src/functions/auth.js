// Validation patterns
const PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\d\s\-\+\(\)]+$/, // Accepts digits, spaces, dashes, plus, and parentheses
    password: /^.{6,}$/, // Minimum 6 characters
    name: /^[a-zA-Z\s]{2,}$/, // At least 2 characters, letters and spaces only
};

// Real-time validation for individual fields
export const validateField = (fieldName, value, formType = "signup") => {
    const errors = {};

    switch (fieldName) {
        case "email":
            if (!value.trim()) {
                errors.email = "Email is required";
            } else if (!PATTERNS.email.test(value)) {
                errors.email = "Please enter a valid email address";
            }
            break;

        case "password":
            if (!value) {
                errors.password = "Password is required";
            } else if (value.length < 6) {
                errors.password = "Password must be at least 6 characters";
            } else if (!/[A-Z]/.test(value)) {
                errors.password = "Password must contain at least one uppercase letter";
            } else if (!/[0-9]/.test(value)) {
                errors.password = "Password must contain at least one number";
            }
            break;

        case "name":
            if (!value.trim()) {
                errors.name = "Name is required";
            } else if (value.trim().length < 2) {
                errors.name = "Name must be at least 2 characters";
            } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                errors.name = "Name can only contain letters and spaces";
            }
            break;

        case "phone":
            if (!value.trim()) {
                errors.phone = "Phone number is required";
            } else if (value.replace(/\D/g, "").length < 10) {
                errors.phone = "Phone number must be at least 10 digits";
            } else if (!PATTERNS.phone.test(value)) {
                errors.phone = "Phone number contains invalid characters";
            }
            break;

        default:
            break;
    }

    return errors;
};

// Validate all fields based on form type
export const validateForm = (formData, formType = "signup", loginOption = 'OTP') => {
    const errors = {};

    // Email validation
    if (!formData.email?.trim()) {
        errors.email = "Email is required";
    } else if (!PATTERNS.email.test(formData.email)) {
        errors.email = "Please enter a valid email address";
    }

    if (loginOption === 'Password' || formType === 'signup') {
        // Password validation
        if (!formData.password) {
            errors.password = "Password is required";
        } else if (formData.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        } else if (!/[A-Z]/.test(formData.password)) {
            errors.password = "Password must contain at least one uppercase letter";
        } else if (!/[0-9]/.test(formData.password)) {
            errors.password = "Password must contain at least one number";
        }
    }
    // Signup-specific validations
    if (formType === "signup") {
        // Name validation
        if (!formData.name?.trim()) {
            errors.name = "Name is required";
        } else if (formData.name.trim().length < 2) {
            errors.name = "Name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
            errors.name = "Name can only contain letters and spaces";
        }

        // Phone validation
        if (!formData.phone?.trim()) {
            errors.phone = "Phone number is required";
        } else if (formData.phone.replace(/\D/g, "").length < 10) {
            errors.phone = "Phone number must be at least 10 digits";
        } else if (!PATTERNS.phone.test(formData.phone)) {
            errors.phone = "Phone number contains invalid characters";
        }
    }

    return errors;
};

// Handle input change with real-time validation
export const handleInputChange = (e, setFormData, formData, setErrors = null, formType = "signup", loginOption = 'OTP') => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time validation if setErrors function is provided
    if (setErrors) {
        const fieldErrors = validateField(name, value, formType, loginOption);
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: fieldErrors[name] || "",
        }));
    }
};

// Handle form submission
export const handleAuthSubmit = (e, formData, formType = "signup", loginOption = 'OTP') => {
    e.preventDefault();

    const errors = validateForm(formData, formType, loginOption);

    if (Object.keys(errors).length === 0) {
        // Form is valid - proceed with submission
        return { success: true, data: formData, errors: {} };
    } else {
        // Form has errors
        return { success: false, data: null, errors };
    }
};

// Check if a specific field has an error
export const hasFieldError = (fieldName, errors) => {
    return errors[fieldName] ? true : false;
};

// Get error message for a field
export const getFieldError = (fieldName, errors) => {
    return errors[fieldName] || "";
};

