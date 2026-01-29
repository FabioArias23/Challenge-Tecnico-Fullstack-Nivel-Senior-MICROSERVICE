/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RoleIds } from 'src/api/role/enum/role.enum';
import { RoleService } from 'src/api/role/services/role.service';
import { CreateUserDto } from 'src/api/user/dto/user.dto';
import { UserService } from 'src/api/user/services/user.service';
import { errorMessages } from 'src/errors/custom';
import { PayloadDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(credentials: CreateUserDto) {
    const { email, password } = credentials;

    // 1. Buscamos al usuario (Incluimos roles para que el front los tenga si los necesita)
    const user = await this.userService.findByEmail(email, { roles: true });
    
    // IMPORTANTE: Si el usuario no existe, lanzamos 401
    if (!user) {
      throw new UnauthorizedException(errorMessages.auth.wrongCredentials);
    }

    // 2. Validamos la contraseña usando bcrypt (vía UserService)
    const isValidPassword = await this.userService.comparePassword(
      password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException(errorMessages.auth.wrongCredentials);
    }

    // 3. Generamos el token
    const tokenData = await this.generateToken({
      id: user.id,
      email: user.email,
    });

    // 4. Devolvemos el token y datos básicos del usuario
    return {
      ...tokenData,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  async register(user: CreateUserDto) {
    const alreadyExistingUser = await this.userService.findByEmail(user.email);
    if (alreadyExistingUser) {
      throw new ConflictException(errorMessages.auth.userAlreadyExist);
    }

    const customerRole = await this.roleService.findById(RoleIds.Customer);

    await this.userService.createUser(user, customerRole);

    return {
      message: 'success',
    };
  }

  async generateToken(payload: PayloadDto) {
    // CAMBIO CRÍTICO: Usamos 'JWT_SECRET' directamente como está en el .env
    // o el path exacto que use tu configuración (usualmente JWT_SECRET)
    const secret = this.configService.get<string>('JWT_SECRET');

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: secret,
    });

    return { accessToken };
  }
}