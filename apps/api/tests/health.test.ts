import { app } from '../src/server';
import http from 'http';

describe('/v1/health', () => {
    let server: http.Server;

    beforeAll((done) => {
        server = app.listen(0, () => done());
    });

    afterAll((done) => {
        server.close(done);
    });

    it('returns ok: true', async () => {
        const address = server.address() as any;
        const port = address.port;

        const response = await fetch(`http://localhost:${port}/v1/health`);
        const data: any = await response.json();

        expect(response.status).toBe(200);
        expect(data.ok).toBe(true);
        expect(data.version).toBeDefined();
        expect(data.env).toBeDefined();
    });

    it('returns models list', async () => {
        const address = server.address() as any;
        const port = address.port;

        const response = await fetch(`http://localhost:${port}/v1/models`);
        const data: any = await response.json();

        expect(response.status).toBe(200);
        expect(Array.isArray(data.models)).toBe(true);
        expect(data.models.length).toBeGreaterThan(0);
    });

    it('requires x-api-key for /v1/prompt', async () => {
        const address = server.address() as any;
        const port = address.port;

        const response = await fetch(`http://localhost:${port}/v1/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idea: 'test idea' }),
        });

        expect(response.status).toBe(401);
    });
});
