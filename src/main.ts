import { VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
	DocumentBuilder,
	SwaggerCustomOptions,
	SwaggerDocumentOptions,
	SwaggerModule,
} from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

dotenv.config({ path: '.env', override: false });

const OPENAPI_SPEC_FILENAME = 'kham_open_api_spec.json';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		cors: { origin: '*' },
	});
	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: VERSION_NEUTRAL,
	});

	if (process.env.NODE_ENV != 'production') openApi(app);
	mvc(app);

	await app.listen(3000, '0.0.0.0');
}

function mvc(app: NestExpressApplication) {
	app.useStaticAssets(join(__dirname, '..', 'mvc', 'public'));
	app.setBaseViewsDir(join(__dirname, '..', 'mvc', 'views'));
	app.setViewEngine('ejs');
}

function openApi(app: NestExpressApplication) {
	const config = new DocumentBuilder()
		.setTitle('API')
		.setDescription('API DOCS')
		.setVersion('1.0')
		.addBearerAuth({
			type: 'http',
			bearerFormat: 'JWT',
		})
		.addServer('http://localhost:3000')
		.build();
	const options: SwaggerDocumentOptions = {
		operationIdFactory: (controllerKey: string, methodKey: string) =>
			controllerKey + '_' + methodKey,
	};
	const document = SwaggerModule.createDocument(app, config, options);
	const document2 = SwaggerModule.createDocument(app, config, {
		operationIdFactory: (controllerKey: string, methodKey: string) =>
			controllerKey.replace('Controller', '') + '_' + methodKey,
	});

	console.log(
		'Swagger:: writing to file: ' +
			join(process.cwd(), OPENAPI_SPEC_FILENAME),
	);
	writeFileSync(
		join(process.cwd(), OPENAPI_SPEC_FILENAME),
		JSON.stringify(document, null, 4),
	);
	writeFileSync(
		join(process.cwd(), OPENAPI_SPEC_FILENAME.replace('.json', '_2.json')),
		JSON.stringify(document2, null, 4),
	);

	const setupOptions: SwaggerCustomOptions = {
		explorer: true,
		customSiteTitle: 'Kham API',
	};
	SwaggerModule.setup('api/docs', app, document, setupOptions);
}

bootstrap();
