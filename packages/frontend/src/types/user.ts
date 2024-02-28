export interface UserType {
    userId?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    createdAt?: string;
    role?: UserRole;
    purchased?: boolean;
    expiration?: string;
}

export enum UserRole {
    Tenant = 'tenant',
    Landlord = 'landlord',
    Agent = 'agent',
}