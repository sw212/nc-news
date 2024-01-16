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

describe("/api/articles", () => {
    describe("GET", () => {
        test("200: responds with an array of articles", () => {
            return request(app)
                .get("/api/articles")
                .expect(200)
                .then((response) => {
                    expect(response.body.articles.length).toBe(13);

                    response.body.articles.forEach((article) => {
                        expect(article).toMatchObject({
                            author: expect.any(String),
                            title: expect.any(String),
                            article_id: expect.any(Number),
                            topic: expect.any(String),
                            created_at: expect.any(String),
                            votes: expect.any(Number),
                            article_img_url: expect.any(String),
                            comment_count: expect.any(Number),
                        });
                    });
                });
        });

        test("200: articles by default are sorted by date (DESC)", () => {
            return request(app)
                .get("/api/articles")
                .expect(200)
                .then((response) => {
                    expect(response.body.articles).toBeSortedBy('created_at', {descending: true});
                });
        });

        test("200: article comment_count's are correctly summed ", () => {
            // counted via text editor ctrl+f for e.g. "article_id: 1"
            const articleid_to_counts =
            {
                1: 11,
                2: 0,
                3: 2,
                4: 0,
                5: 2,
                6: 1,
                7: 0,
                8: 0,
                9: 2,
                10: 0,
                11: 0,
                12: 0,
                13: 0,
            };
            
            return request(app)
                .get("/api/articles")
                .expect(200)
                .then((response) => {
                    response.body.articles.forEach((article) => {
                        const id = article.article_id;
                        expect(article.comment_count).toBe(articleid_to_counts[id]);
                    });
                });
        });
    });
});

describe("/api/articles/:article_id", () => {
    describe("GET", () => {
        describe("if valid article_id", () => {
            test("200: responds with an article object", () => {
                return request(app)
                    .get("/api/articles/1")
                    .expect(200)
                    .then((response) => {
                        expect(response.body.article).toEqual({
                            article_id: 1,
                            title: "Living in the shadow of a great man",
                            topic: "mitch",
                            author: "butter_bridge",
                            body: "I find this existence challenging",
                            created_at: "2020-07-09T20:11:00.000Z",
                            votes: 100,
                            article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                        });
                    });
            });

            test("404: responds with error message if no article exists with given article_id", () => {
                return request(app)
                    .get("/api/articles/99")
                    .expect(404)
                    .then((response) => {
                        expect(response.body.msg).toBe("Article not found");
                    });
            });
        });

        describe("if invalid article_id", () => {
            test("400: responds with error message", () => {
                return request(app)
                    .get("/api/articles/invalid")
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });
        });
    });

    describe("PATCH", () => {
        describe("if valid article_id", () => {
            test("200: responds with updated article", () => {
                return request(app)
                    .patch("/api/articles/1")
                    .send({
                        inc_votes: -10
                    })
                    .expect(200)
                    .then((response) => {
                        expect(response.body.article).toEqual({
                            article_id: 1,
                            title: "Living in the shadow of a great man",
                            topic: "mitch",
                            author: "butter_bridge",
                            body: "I find this existence challenging",
                            created_at: "2020-07-09T20:11:00.000Z",
                            votes: 90,
                            article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                        });
                    });
            });

            test("404: responds with error message if no article exists for given article_id", () => {
                return request(app)
                    .patch("/api/articles/99")
                    .send({
                        inc_votes: -10
                    })
                    .expect(404)
                    .then((response) => {
                        expect(response.body.msg).toBe("Article not found");
                    });
            });

            test("400: responds with error message if invalid inc_votes", () => {
                return request(app)
                    .patch("/api/articles/1")
                    .send({
                        inc_votes: "ten",
                    })
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });

            test("400: responds with error message if missing body", () => {
                return request(app)
                    .patch("/api/articles/1")
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });
        });

        describe("if invalid article_id", () => {
            test("400: responds with error message", () => {
                return request(app)
                    .patch("/api/articles/invalid")
                    .send({
                        inc_votes: -10,
                    })
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });
        });
    })
});

describe("/api/articles/:article_id/comments", () => {
    describe("GET", () => {
        describe("if valid article_id", () => {
            test("200: responds with an array of comments for given article_id", () => {
                return request(app)
                    .get("/api/articles/1/comments")
                    .expect(200)
                    .then((response) => {
                        const comments = response.body.comments;
                        expect(comments.length).toBe(11);

                        comments.forEach((comment) => {
                            expect(comment).toMatchObject({
                                comment_id: expect.any(Number),
                                votes: expect.any(Number),
                                created_at: expect.any(String),
                                author: expect.any(String),
                                body: expect.any(String),
                                article_id: 1,
                            });
                        });
                    });
            });

            test("200: comments by default are sorted by date (ASC)", () => {
                return request(app)
                    .get("/api/articles/1/comments")
                    .expect(200)
                    .then((response) => {
                        expect(response.body.comments).toBeSortedBy('created_at', {descending: false});
                    });
            });

            test("200: responds with empty array if no comments exist for given article_id", () => {
                return request(app)
                    .get("/api/articles/2/comments")
                    .expect(200)
                    .then((response) => {
                        expect(response.body.comments).toEqual([]);
                    });
            });

            test("404: responds with error message if no article exists for given article_id", () => {
                return request(app)
                    .get("/api/articles/99/comments")
                    .expect(404)
                    .then((response) => {
                        expect(response.body.msg).toBe("Article not found");
                    });
            });
        });

        describe("if invalid article_id", () => {
            test("400: responds with error message", () => {
                return request(app)
                    .get("/api/articles/invalid/comments")
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });
        });
    });

    describe("POST", () => {
        describe("if valid article_id", () => {
            test("201: responds with created comment", () => {
                return request(app)
                    .post("/api/articles/1/comments")
                    .send({
                        username: "butter_bridge",
                        body: "TLDR"
                    })
                    .expect(201)
                    .then((response) => {
                        expect(response.body).toEqual({comment: "TLDR"});
                    });
            });

            test("201: ignores unnecessary properties on comment body", () => {
                return request(app)
                    .post("/api/articles/1/comments")
                    .send({
                        username: "butter_bridge",
                        body: "TLDR",
                        prop: "ignored",
                    })
                    .expect(201)
                    .then((response) => {
                        expect(response.body).toEqual({comment: "TLDR"});
                    });
            });

            test("404: responds with error message if no article exists for given article_id", () => {
                return request(app)
                    .post("/api/articles/199/comments")
                    .send({
                        username: "butter_bridge",
                        body: "TLDR"
                    })
                    .expect(404)
                    .then((response) => {
                        expect(response.body.msg).toBe("Article not found");
                    });
            });

            test("400: responds with error message if request body has missing information", () => {
                return request(app)
                    .post("/api/articles/1/comments")
                    .send({
                        username: "butter_bridge",
                    })
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });


            test("400: responds with error message if username is invalid", () => {
                return request(app)
                    .post("/api/articles/1/comments")
                    .send({
                        username: 404,
                        body: "TLDR"
                    })
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });

            test("400: responds with error message if body is invalid", () => {
                return request(app)
                    .post("/api/articles/1/comments")
                    .send({
                        username: "butter_bridge",
                        body: 404
                    })
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });
        });

        describe("if invalid article_id", () => {
            test("400: responds with error message", () => {
                return request(app)
                    .post("/api/articles/invalid/comments")
                    .send({
                        username: "butter_bridge",
                        body: "TLDR"
                    })
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });
        });
    });
});