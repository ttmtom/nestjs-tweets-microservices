import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../apps/api-gateway/src/app/app.module';
import { LoginDto, RegisterDto } from '../../apps/api-gateway/src/app/dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/register (POST) - success', async () => {
    const registerDto: RegisterDto = {
      username: 'testuser',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
    };

    const response = await request(app.getHttpServer())
      .post('/register')
      .send(registerDto)
      .expect(201);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.username).toBe(registerDto.username);
    expect(response.body).toHaveProperty('token');
  });

  it('/login (POST) - success', async () => {
    const loginDto: LoginDto = {
      username: 'testuser',
      password: 'password123',
    };

    const response = await request(app.getHttpServer())
      .post('/login')
      .send(loginDto)
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user.username).toBe(loginDto.username);
    expect(response.body).toHaveProperty('token');
  });

  it('/login (POST) - invalid credentials', async () => {
    const loginDto: LoginDto = {
      username: 'testuser',
      password: 'wrongpassword',
    };

    await request(app.getHttpServer())
      .post('/login')
      .send(loginDto)
      .expect(401);
  });
});
