// import { EUserRole } from '@libs/contracts/auth/enums';
// import { INestApplication } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import * as request from 'supertest';
// import { AppModule } from '../../apps/api-gateway/src/app/app.module';
// import { RegisterDto } from '../../apps/api-gateway/src/app/dto';
//
// describe('UsersController (e2e)', () => {
//   let app: INestApplication;
//   let adminToken: string;
//   let userToken: string;
//   let createdUserId: string;
//
//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();
//
//     app = moduleFixture.createNestApplication();
//     await app.init();
//
//     // Register and login an admin user
//     const adminRegisterDto: RegisterDto = {
//       username: 'adminuser',
//       password: 'adminpassword',
//       firstName: 'Admin',
//       lastName: 'User',
//       dateOfBirth: new Date('1990-01-01'),
//     };
//
//     const adminRes = await request(app.getHttpServer())
//       .post('/register')
//       .send(adminRegisterDto)
//       .expect(201);
//
//     adminToken = adminRes.body.token;
//
//     // Register and login a regular user
//     const userRegisterDto: RegisterDto = {
//       username: 'regularuser',
//       password: 'userpassword',
//       firstName: 'Regular',
//       lastName: 'User',
//       dateOfBirth: new Date('1992-05-15'),
//     };
//
//     const userRes = await request(app.getHttpServer())
//       .post('/register')
//       .send(userRegisterDto)
//       .expect(201);
//
//     userToken = userRes.body.token;
//   });
//
//   afterAll(async () => {
//     await app.close();
//   });
//
//   it('/users (GET) - should return all users for admin', async () => {
//     const response = await request(app.getHttpServer())
//       .get('/users')
//       .set('Authorization', `Bearer ${adminToken}`)
//       .expect(200);
//
//     expect(response.body).toHaveProperty('data');
//     expect(Array.isArray(response.body.data)).toBe(true);
//   });
//
//   it('/users (GET) - should be forbidden for non-admin', async () => {
//     await request(app.getHttpServer())
//       .get('/users')
//       .set('Authorization', `Bearer ${userToken}`)
//       .expect(403);
//   });
//
//   it('/users (POST) - should create a new user by admin', async () => {
//     const createUserDto = {
//       username: 'newuser',
//       password: 'newpassword',
//       firstName: 'New',
//       lastName: 'User',
//       dateOfBirth: new Date('1995-08-20'),
//       role: EUserRole.USER,
//     };
//
//     const response = await request(app.getHttpServer())
//       .post('/users')
//       .set('Authorization', `Bearer ${adminToken}`)
//       .send(createUserDto)
//       .expect(201);
//
//     expect(response.body).toHaveProperty('id');
//     expect(response.body.username).toBe(createUserDto.username);
//     createdUserId = response.body.id;
//   });
//
//   it('/users (POST) - should be forbidden for non-admin', async () => {
//     const createUserDto = {
//       username: 'anotheruser',
//       password: 'anotherpassword',
//       firstName: 'Another',
//       lastName: 'User',
//       dateOfBirth: new Date('1998-12-10'),
//       role: EUserRole.USER,
//     };
//
//     await request(app.getHttpServer())
//       .post('/users')
//       .set('Authorization', `Bearer ${userToken}`)
//       .send(createUserDto)
//       .expect(403);
//   });
//
//   it('/users/:id (GET) - should return user by id for admin', async () => {
//     await request(app.getHttpServer())
//       .get(`/users/${createdUserId}`)
//       .set('Authorization', `Bearer ${adminToken}`)
//       .expect(200);
//   });
//
//   it('/users/:id (GET) - should return user by id for the user themselves', async () => {
//     // Assuming you have a way to get the regular user's idHash after registration
//     const userDetails = await request(app.getHttpServer())
//       .get('/users/me') // You might need to create a /me endpoint or adjust this
//       .set('Authorization', `Bearer ${userToken}`);
//
//     if (userDetails.status === 200) {
//       await request(app.getHttpServer())
//         .get(`/users/${userDetails.body.id}`)
//         .set('Authorization', `Bearer ${userToken}`)
//         .expect(200);
//     }
//   });
//
//   it('/users/:id (GET) - should be forbidden for other users', async () => {
//     await request(app.getHttpServer())
//       .get(`/users/${createdUserId}`)
//       .set('Authorization', `Bearer ${userToken}`)
//       .expect(403);
//   });
//
//   it('/users/:id (PUT) - should update user by id for admin', async () => {
//     const updateUserDto = { firstName: 'Updated' };
//
//     await request(app.getHttpServer())
//       .put(`/users/${createdUserId}`)
//       .set('Authorization', `Bearer ${adminToken}`)
//       .send(updateUserDto)
//       .expect(200);
//   });
//
//   it('/users/:id (PUT) - should update user by id for the user themselves', async () => {
//     const userDetails = await request(app.getHttpServer())
//       .get('/users/me') // You might need a /me endpoint
//       .set('Authorization', `Bearer ${userToken}`);
//
//     if (userDetails.status === 200) {
//       const updateUserDto = { firstName: 'My Updated Name' };
//       await request(app.getHttpServer())
//         .put(`/users/${userDetails.body.id}`)
//         .set('Authorization', `Bearer ${userToken}`)
//         .send(updateUserDto)
//         .expect(200);
//     }
//   });
//
//   it('/users/:id (PUT) - should be forbidden for other users', async () => {
//     const updateUserDto = { firstName: 'Unauthorized Update' };
//
//     await request(app.getHttpServer())
//       .put(`/users/${createdUserId}`)
//       .set('Authorization', `Bearer ${userToken}`)
//       .send(updateUserDto)
//       .expect(403);
//   });
//
//   it('/users/:id (DELETE) - should delete user by id for admin', async () => {
//     await request(app.getHttpServer())
//       .delete(`/users/${createdUserId}`)
//       .set('Authorization', `Bearer ${adminToken}`)
//       .expect(200);
//   });
//
//   it('/users/:id (DELETE) - should be forbidden for non-admin', async () => {
//     // Assuming you have another user ID that the regular user cannot delete
//     await request(app.getHttpServer())
//       .delete(`/users/${createdUserId}`) // Use a different ID here if possible
//       .set('Authorization', `Bearer ${userToken}`)
//       .expect(403);
//   });
// });
