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

describe("/api/comments/:comment_id", () => {
    describe("DELETE", () => {
        describe("if valid comment_id", () => {
            test("204: successfully removes comment", async () => {
                {
                    const response = await request(app).delete("/api/comments/1");
                    expect(response.statusCode).toBe(204);
                    expect(response.body).toEqual({});
                }

                {
                    const response = await request(app).delete("/api/comments/1");
                    expect(response.statusCode).toBe(404);
                    expect(response.body.msg).toBe("Comment not found");
                }
            });

            test("404: responds with error message if no comment exists with given comment_id", () => {
                return request(app)
                    .delete("/api/comments/99")
                    .expect(404)
                    .then((response) => {
                        expect(response.body.msg).toBe("Comment not found");
                    });
            })
        });

        describe("if invalid comment_id", () => {
            test("400: responds with error message", () => {
                return request(app)
                    .delete("/api/comments/invalid")
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            })
        })
    });
});