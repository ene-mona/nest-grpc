import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo]),
    ClientsModule.register([
      {
        name: 'TEDDY_TODO_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'todo',
          protoPath: join(__dirname, '../../../proto/teddy.proto'),
          url: 'localhost:50052', // CHANGE THIS TO YOUR COLLEAGUE'S SERVER
        },
      },
    ]),
],
  providers: [TodoService],
  controllers: [TodoController]
})
export class TodoModule {}
