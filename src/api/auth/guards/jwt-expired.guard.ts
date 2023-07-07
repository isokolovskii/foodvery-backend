import { AuthGuard } from '@nestjs/passport';

export class JwtExpiredGuard extends AuthGuard('jwt-expired') {}
