import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
 
  const REST_PORT = process.env.PORT ?? 3000; // Render exposes only one port (must be REST)
  const GRPC_PORT = process.env.GRPC_PORT ?? 50051;
  const app = await NestFactory.create(AppModule);
  app.enableCors(); 
  await app.listen(REST_PORT);
  console.log(`✅ REST API is running on http://localhost:${REST_PORT}...`);

  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'todo',
      protoPath: join(__dirname, '../../proto/todo.proto'),
      url: `localhost:${GRPC_PORT}`,
    },
  });

  await grpcApp.listen();
  
}
bootstrap();
