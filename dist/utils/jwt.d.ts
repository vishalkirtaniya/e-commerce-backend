export interface JwtPayload {
    userId: string;
    email: string;
}
export declare function signAccessToken(payload: JwtPayload): string;
export declare function verifyAccessToken(token: string): JwtPayload;
export declare function signRefreshToken(payload: JwtPayload): string;
export declare function verifyRefreshToken(token: string): JwtPayload;
export declare function getTokenExpiry(token: string): number;
//# sourceMappingURL=jwt.d.ts.map