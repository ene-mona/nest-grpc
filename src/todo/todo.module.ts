import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { credentials } from '@grpc/grpc-js';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TODO_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'todo',
          protoPath: join(__dirname, '../../../proto/todo.proto'),
          //url: 'localhost:50052', //colleagues
           url:'nest-todo-2-production.up.railway.app:50052',
          // credentials: credentials.createSsl(),
          
        },
      },
    ]),
    TypeOrmModule.forFeature([Todo]),

],
  providers: [TodoService],
  controllers: [TodoController]
})
export class TodoModule {}
