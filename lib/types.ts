
export interface UserType {
    id: string,
    address: string | null,
    city: string | null,
    createdAt: string,
    dateOfBirth: string | null,
    email?: string,
    emailVerified:boolean,
    firstName?: string,
    lastName?: string,
    nationalId?: string,
    phone?: string,
    phoneVerified: boolean,
    postalCode?: string,
    provience?: string,
    role?: "USER" | "ADMIN"
}