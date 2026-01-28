/* eslint-disable prettier/prettier */
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Carga .env solo si estamos en local y no en producción (donde ya existen las vars)
if (process.env.NODE_ENV !== 'production') {
  config(); 
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities: ['dist/**/*.entity.js'], // Apuntamos a dist para producción
  migrations: ['dist/database/migration/history/*.js'],
  synchronize: false, 
  logging: process.env.NODE_ENV === 'development',
};

// Default export para CLI de TypeORM
const datasource = new DataSource(dataSourceOptions);
export default datasource;