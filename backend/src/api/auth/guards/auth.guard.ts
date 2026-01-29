/* eslint-disable prettier/prettier */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/api/user/services/user.service';
import { errorMessages } from 'src/errors/custom';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // 1. Validar existencia del header
    if (!authHeader) {
      throw new UnauthorizedException(errorMessages.auth.invalidToken);
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException(errorMessages.auth.invalidToken);
    }

    // --- LÓGICA DE TOKEN DE PRUEBAS (Busca en DB) ---
    if (token === 'nexus_token_v1') {
      // Intentamos buscar al admin creado por el seeder
      const user = await this.userService.findByEmail('admin@admin.com', { roles: true }); 
      
      if (!user) {
        this.logger.error('❌ Token nexus detectado pero el usuario admin@admin.com NO existe en la base de datos.');
        throw new UnauthorizedException('Usuario semilla no encontrado. Ejecuta npm run seed:run');
      }

      this.logger.log(`✅ Acceso concedido via Nexus Token para: ${user.email}`);
      request.user = user;
      return true; // Acceso concedido, salta la validación JWT
    }
    // ------------------------------------------------

    try {
      // 3. Verificar JWT Real (Para producción)
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userService.findById(payload.id, {
        roles: true,
      });

      if (!user) {
        throw new UnauthorizedException(errorMessages.user.notFound);
      }

      request.user = user;
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(errorMessages.auth.expiredToken);
      }
      throw new UnauthorizedException(errorMessages.auth.invalidToken);
    }
  }
}