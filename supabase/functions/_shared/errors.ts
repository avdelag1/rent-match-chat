// supabase/functions/_shared/errors.ts

// Base class for application errors
class AppError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error class for not found errors
class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`);
    }
}

// Error class for validation errors
class ValidationError extends AppError {
    constructor(message: string) {
        super(`Validation Error: ${message}`);
    }
}

// Error class for database errors
class DatabaseError extends AppError {
    constructor(message: string) {
        super(`Database Error: ${message}`);
    }
}

// Error class for unauthorized access errors
class UnauthorizedError extends AppError {
    constructor() {
        super('Unauthorized access');
    }
}

// Utility function to throw a not found error
const throwNotFoundError = (resource: string) => {
    throw new NotFoundError(resource);
};

// Utility function to throw a validation error
const throwValidationError = (message: string) => {
    throw new ValidationError(message);
};

// Utility function to throw a database error
const throwDatabaseError = (message: string) => {
    throw new DatabaseError(message);
};

// Utility function to throw an unauthorized error
const throwUnauthorizedError = () => {
    throw new UnauthorizedError();
};

// Exporting the classes and utilities
export {
    AppError,
    NotFoundError,
    ValidationError,
    DatabaseError,
    UnauthorizedError,
    throwNotFoundError,
    throwValidationError,
    throwDatabaseError,
    throwUnauthorizedError,
};