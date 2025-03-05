import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as grpc from '@grpc/grpc-js';


const GRPC_URL = 'dns:///teddy-todo-876551831298.us-central1.run.app:443'
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TODO_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'todo',
          protoPath: join(__dirname, '../../../proto/todo.proto'),
         // url: 'localhost:8081', //colleagues
          url:GRPC_URL,
         credentials: grpc.credentials.createSsl(), 
        },
      },
    ]),
    TypeOrmModule.forFeature([Todo]),

],
  providers: [
    TodoService,
    { provide: 'GRPC_URL', useValue: GRPC_URL },

  ],
  controllers: [TodoController]
})
export class TodoModule {}
