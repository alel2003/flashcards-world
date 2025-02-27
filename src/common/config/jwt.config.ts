import { ConfigService } from "@nestjs/config";

import { JwtModuleOptions } from "@nestjs/jwt";

export const getJwtConfig = async (configService: ConfigService): Promise<JwtModuleOptions> => ({
    secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    signOptions: {
        expiresIn: parseInt(configService.getOrThrow<string>('ACCESS_TOKEN_VALIDITY_DURATION_IN_SEC'), 10)
    }
});