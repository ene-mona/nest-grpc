import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  // ✅ Start HTTP REST API (Port 3000)
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Optional: Enable CORS for frontend requests
  await app.listen(3000);
  console.log(`✅ REST API is running on http://localhost:3000`);

  // ✅ Start gRPC Microservice (Port 50051)
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'todo',
      protoPath: join(__dirname, '../../proto/todo.proto'),
      url: '0.0.0.0:50051', // gRPC listens on 50051
    },
  });

  await grpcApp.listen();
  console.log(`✅ gRPC Microservice is running on port 50051`);
}
bootstrap();
