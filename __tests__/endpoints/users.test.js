const request = require("supertest");
const app = require("../../app");
const db  = require("../../db/connection");
const seed = require("../../db/seeds/seed");
const data = require("../../db/data/test-data");

beforeEach(async () => {
    await seed(data);
});
afterAll(async () => {
    await db.end();
});

describe("/api/users", () => {
    describe("GET", () => {
        test("200: responds with an array of users", () => {
            return request(app)
                .get("/api/users")
                .expect(200)
                .then((response) => {
                    expect(response.body.users.length).toBe(4);

                    response.body.users.forEach((user) => {
                        expect(user).toMatchObject({
                            username: expect.any(String),
                            name: expect.any(String),
                            avatar_url: expect.any(String),
                        });
                    });
                });
        });
    });
});