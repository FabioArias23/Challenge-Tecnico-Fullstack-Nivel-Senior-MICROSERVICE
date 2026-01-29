/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { SeederInterface } from '../seeder.interface';
import { hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/database/entities/user.entity';
import { Role } from 'src/database/entities/role.entity';

@Injectable()
export class AdminSeeder implements SeederInterface {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    private readonly config: ConfigService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async seed() {
    const data: Partial<User> = await this.generateData();
    
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      // 1. Buscamos si el usuario ya existe para no duplicar ni romper restricciones
      let adminUser = await transactionalEntityManager.getRepository(User).findOne({
        where: { email: data.email }
      });

      if (!adminUser) {
        this.logger.log(`Creando nuevo usuario admin: ${data.email}`);
        adminUser = transactionalEntityManager.create(User, {
            email: data.email,
            password: data.password
        });
      } else {
        this.logger.log(`Actualizando contraseña de admin existente: ${data.email}`);
        adminUser.password = data.password;
      }

      // 2. Asignamos los roles (VITAL para que el RolesGuard te deje crear productos)
      adminUser.roles = data.roles;
      
      await transactionalEntityManager.save(adminUser);
      this.logger.log('✅ Admin Seeder completado con éxito');
    });
  }

  async generateData(): Promise<Partial<User>> {
    // IMPORTANTE: Asegúrate de que estas keys coincidan con tu .env o usa los defaults
    const email = this.config.get<string>('ADMIN_USER_EMAIL') || 'admin@admin.com';
    const password = this.config.get<string>('ADMIN_USER_PASSWORD') || 'admin123';
    
    this.logger.log(`Generando datos para ${email} con password ${password}`);
    
    const hashedPassword = await hash(password, 10);
    const adminRoles = await this.rolesRepository.find(); // Trae Admin, Merchant, Customer
    
    if (adminRoles.length === 0) {
        throw new Error('No se encontraron roles en la DB. ¿Corriste el RolesSeeder primero?');
    }

    return {
      email: email,
      password: hashedPassword,
      roles: adminRoles,
    };
  }
}
