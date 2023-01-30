// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;

beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('lenovo', 'Lenovo', 'laptop') RETURNING  code, name, description`);
    testCompany = result.rows[0];
  });

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("Get a list with one company", async () => {
    const res = await request(app).get('/companies');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ company: [testCompany] })
  });
});


describe("GET /companies/:code", () => {
  test("Gets a single company", async () => {
    const res = await request(app).get(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ company: testCompany })
  });
  test("Responds with 404 for invalid code", async () => {
    const res = await request(app).get(`/companies/0`)
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /companies", () => {
  test("Creates a single company", async () => {
    const res = await request(app).post('/companies').send({ code: 'lenovo', name: 'Lenovo', description: 'laptop' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: { code: 'lenovo', name: 'Lenovo', description: 'laptop' }
    });
  });
});

describe("PATCH /companies/:code", () => {
  test("Updates a single company", async () => {
    const res = await request(app).patch(`/companies/${testCompany.code}`).send({ code: 'lenovoo', name: 'Lenovo2' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: { code: testCompany.code, name: 'Lenovo2' }
    });
  });
  test("Responds with 404 for invalid code", async () => {
    const res = await request(app).patch(`/companies/0`).send({ code: 'lenovoo', name: 'Lenovo2' });
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /companies/:code", () => {
  test("Deletes a single company", async () => {
    const res = await request(app).delete(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: 'DELETED!' })
  })
})
