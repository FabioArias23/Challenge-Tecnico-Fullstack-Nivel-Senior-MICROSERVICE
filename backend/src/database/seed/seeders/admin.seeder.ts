/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { SeederInterface } from '../seeder.interface';
import { hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/database/entities/user.entity';
import { Role } from 'src/database/entities/role.entity';

@Injectable()
export class AdminSeeder implements SeederInterface {
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
      const result = await transactionalEntityManager.upsert(User, data, {
        conflictPaths: ['email'],
      });
      const adminUser = await transactionalEntityManager
        .getRepository(User)
        .findOne({
          where: {
            id: result.raw[0].id,
          },
        });
      adminUser.roles = data.roles;
      await transactionalEntityManager.save(adminUser);
    });
  }

   async generateData(): Promise<Partial<User>> {
    // CAMBIO: Leemos directo del env o usamos un default seguro
    const password = this.config.get<string>('ADMIN_PASSWORD') || 'admin123';
    const email = this.config.get<string>('ADMIN_EMAIL') || 'admin@example.com';
    
    const hashedPassword = await hash(password, 10);
    const adminRoles = await this.rolesRepository.find();
    
    return {
      email: email,
      password: hashedPassword,
      roles: adminRoles,
    };
  }
}
