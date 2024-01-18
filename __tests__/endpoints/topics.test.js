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

    describe("POST", () => {
        describe("if valid topic", () => {
            test("201: responds with created topic", () => {
                return request(app)
                    .post("/api/topics")
                    .send({
                        slug: "football",
                        description: "Footie!",
                    })
                    .expect(201)
                    .then((response) => {
                        expect(response.body.topic).toEqual({
                            slug: "football",
                            description: "Footie!",
                        });
                    });
            });

            test("201: ignores unnecessary properties on topic body", () => {
                return request(app)
                    .post("/api/topics")
                    .send({
                        slug: "football",
                        description: "Footie!",
                        prop: "ignored",
                    })
                    .expect(201)
                    .then((response) => {
                        expect(response.body.topic).toEqual({
                            slug: "football",
                            description: "Footie!",
                        });
                    });
            });

            test("201: accepts a topic with no description", () => {
                return request(app)
                    .post("/api/topics")
                    .send({
                        slug: "football",
                    })
                    .expect(201)
                    .then((response) => {
                        expect(response.body.topic).toEqual({
                            slug: "football",
                            description: "",
                        });
                    });
            });

            test("409: topic already exists", () => {
                return request(app)
                    .post("/api/topics")
                    .send({
                        slug: "mitch",
                        description: "Name of a person",
                    })
                    .expect(409)
                    .then((response) => {
                        expect(response.body.msg).toBe("Entry already exists");
                    });
            });
        });

        describe("if invalid topic", () => {
            test("400: responds with error message if slug is missing", () => {
                return request(app)
                    .post("/api/topics")
                    .send({
                        description: "Name of a person",
                    })
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });

            test("400: responds with error message if invalid slug", () => {
                return request(app)
                    .post("/api/topics")
                    .send({
                        slug: 400,
                        description: "Name of a person",
                    })
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });

            test("400: responds with error message if invalid description", () => {
                return request(app)
                    .post("/api/topics")
                    .send({
                        slug: "football",
                        description: 400,
                    })
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });

        })
    })
});