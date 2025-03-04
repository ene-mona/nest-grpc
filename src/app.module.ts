import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoModule } from './todo/todo.module';
import "dotenv/config"
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';


@Module({
  imports: [
  
    TypeOrmModule.forRoot(
      {
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: +(process.env.DB_PORT ?? 3306),
      username:process.env.DB_USERNAME || 'appuser',
      password: process.env.DB_PASSWORD || 'apppassword',
      database: process.env.DB_NAME || 'todo_db',
      // entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,  // setting this to true will load entities automatically from the entities folder
      // logging: true, // setting this to true will log SQL queries in the console
      // logger: 'advanced-console', // setting this to 'advanced-console' will log SQL queries in a more readable format
      // migrations: [__dirname + '/migrations/*{.ts,.js}'], // setting this to load your migrations from the migrations folder
      // migrationsRun: true, // setting this to true will automatically run your migrations on start
      // cli: {
        // migrationsDir: 'src/migrations', // setting this to 'src/migrations' will load your migrations from the src/migrations folder
      // },
      // entities: [__dirname + '/entity/**/*.ts'], // setting this to load your entities from the entity folder
      // ssl: false, // setting this to true will use SSL for connecting to the database
      synchronize: true, //setting this to true should be avoided in production - otherwise you may lose data
    }
  ),

    TodoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
