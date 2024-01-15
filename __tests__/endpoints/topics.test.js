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

describe("/api/topics", () => {
    describe("GET", () => {
        test("200: responds with an array of topics containing a slug + description", () => {
            return request(app)
                .get("/api/topics")
                .expect(200)
                .then((response) => {
                    expect(response.body).toEqual({
                        topics:
                        [
                            { description: 'The man, the Mitch, the legend', slug: 'mitch' },
                            { description: 'Not dogs', slug: 'cats' },
                            { description: 'what books are made of', slug: 'paper' }
                        ]
                    });
                });
        });
    });
});