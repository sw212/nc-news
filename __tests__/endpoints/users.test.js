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

describe("/api/users/:username", () => {
    describe("GET", () => {
        describe("if exists", () => {
            test("200: responds with a user object", () => {
                return request(app)
                    .get("/api/users/icellusedkars")
                    .expect(200)
                    .then((response) => {
                        expect(response.body.user).toEqual({
                            username: 'icellusedkars',
                            name: 'sam',
                            avatar_url: 'https://avatars2.githubusercontent.com/u/24604688?s=460&v=4',
                        });
                    });
            });
        });

        describe("if does not exist", () => {
            test("404: responds with an error message", () => {
                return request(app)
                    .get("/api/users/user404")
                    .expect(404)
                    .then((response) => {
                        expect(response.body.msg).toBe("User not found");
                    });
            });
        });
    });
});