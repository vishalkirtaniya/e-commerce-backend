import type { SignupInput, SigninInput, ForgotPasswordInput, VerifyOtpInput, ResetPasswordInput } from "./auth.schema";
export declare class AuthServiceError extends Error {
    readonly statusCode: number;
    constructor(message: string, statusCode?: number);
}
export declare function signup(input: SignupInput): Promise<{
    user: {
        id: string;
        email: string;
        full_name: string;
    };
    access_token: string;
    refresh_token: string;
}>;
export declare function signin(input: SigninInput): Promise<{
    user: {
        id: any;
        email: any;
        full_name: any;
    };
    access_token: string;
    refresh_token: string;
}>;
export declare function refreshTokens(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
}>;
export declare function logout(userId: string, accessToken: string): Promise<{
    message: string;
}>;
export declare function sendForgotPasswordOtp(input: ForgotPasswordInput): Promise<void>;
export declare function verifyOtp(input: VerifyOtpInput): Promise<void>;
export declare function resetPassword(input: ResetPasswordInput): Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map