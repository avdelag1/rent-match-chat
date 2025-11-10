// API Request and Response Types

// Example Type for a single user
export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

// Request type for getting a user
export interface GetUserRequest {
    userId: string;
}

// Response type for getting a user
export interface GetUserResponse {
    user: User;
}

// Request type for creating a new user
export interface CreateUserRequest {
    name: string;
    email: string;
}

// Response type for creating a new user
export interface CreateUserResponse {
    user: User;
}

// Request type for updating user information
export interface UpdateUserRequest {
    userId: string;
    name?: string;
    email?: string;
}

// Response type for updating user information
export interface UpdateUserResponse {
    user: User;
}