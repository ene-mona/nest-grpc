import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
 
  const GRPC_PORT = process.env.GRPC_PORT ?? 50051;
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'todo',
      protoPath: join(__dirname, '../../proto/todo.proto'),
      url: `0.0.0.0:${GRPC_PORT}`,
    },
  });

  await app.listen();
  console.log(`Microservice is listening on port ${GRPC_PORT}`);
  
}
bootstrap();
