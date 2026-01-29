/* eslint-disable prettier/prettier */
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  config(); 
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  // Si existe DATABASE_URL (Railway), la usamos. Si no, usamos las variables sueltas (Local).
  url: process.env.DATABASE_URL, 
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  
  entities: [process.env.NODE_ENV === 'production' ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
  migrations: [process.env.NODE_ENV === 'production' ? 'dist/database/migration/history/*.js' : 'src/database/migration/history/*.ts'],
  
  synchronize: false, 
  logging: process.env.NODE_ENV === 'development',
  
  // SSL es OBLIGATORIO para bases de datos en la nube (Railway/Render)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

const datasource = new DataSource(dataSourceOptions);
export default datasource;