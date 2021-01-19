// Core
import request from 'supertest';

// Tools
import { app } from '../../../server';
const server = request.agent(app);

describe('should handle secure route /users', () => {
    beforeAll(async (done) => {
        const email = 'jdoe@email.com';
        const response = await server.post('/login').send({ email });

        const cookie = response.headers[ 'set-cookie' ][ 0 ];

        server.jar.setCookie(cookie);
        done();
    });

    test('should have 200 status code for correct data', async (done) => {
        const response = await server.get('/users');

        expect(response.statusCode).toBe(200);
        done();
    });
    test('should return a collection array', async (done) => {
        const response = await server.get('/users');

        const {
            body: { data },
        } = response;
        const isDataArray = Array.isArray(data);
        expect(isDataArray).toBeTruthy();
        done();
    });
});
