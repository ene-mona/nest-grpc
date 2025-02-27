import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
 
  const PORT = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);
  app.enableCors(); 
  await app.listen(PORT);
  console.log(`✅ REST API is running on http://localhost:${PORT}...`);

  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'todo',
      protoPath: join(__dirname, '../../proto/todo.proto'),
      url: `localhost:${PORT}`,
    },
  });

  await grpcApp.listen();
  
}
bootstrap();
