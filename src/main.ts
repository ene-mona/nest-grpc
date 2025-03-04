import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ReflectionService } from '@grpc/reflection';

async function bootstrap() {
  const PORT = process.env.PORT ?? '8080';
  // const REST_PORT = process.env.PORT || '8080';
  //const isCloudRun = process.env.K_SERVICE !== undefined; // ✅ Detect Cloud Run
  // const GRPC_PORT = REST_PORT;
  
  // Express App
  // const expressApp = express();

  // Create NestJS app with Express
  // const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  // app.enableCors();
  // await app.init();

  // Use spdy to create an HTTP/2 (h2c) server
  // const server = spdy.createServer(
  //   {
  //     spdy: {
  //       protocols: ['h2', 'http/1.1'], // Enable HTTP/2 and fallback to HTTP/1.1
  //       plain: true,  // Ensure h2c (cleartext HTTP/2) mode
  //     },
  //   },
  //   expressApp
  // );

  // server.listen(parseInt(REST_PORT), () => {
  //   console.log(`✅ REST API (h2c) is running on http://0.0.0.0:${REST_PORT}`);
  // });

  // Start gRPC Server
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'todo',
      protoPath: join(__dirname, '../../proto/todo.proto'),
      url: `0.0.0.0:${PORT}`,
      onLoadPackageDefinition: (pkg, server) => {
        new ReflectionService(pkg).addToServer(server);
      },
    },
  });

  await grpcApp.listen();
  console.log(`✅ gRPC Service is running on http://0.0.0.0:${PORT}`);
}

bootstrap();
