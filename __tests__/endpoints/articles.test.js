const request = require("supertest");
const app = require("../../app");
const db  = require("../../db/connection");
const seed = require("../../db/seeds/seed");
const data = require("../../db/data/test-data");

jest.setTimeout(10000);

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
                    expect(response.body.articles.length).toBe(10);

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

        describe("query: topic", () => {
            describe("if exists", () => {
                test("200: responds with array of articles filtered by topic", () => {
                    return request(app)
                        .get("/api/articles?topic=mitch")
                        .expect(200)
                        .then((response) => {
                            response.body.articles.forEach((article) => {
                                expect(article).toMatchObject({
                                    author: expect.any(String),
                                    title: expect.any(String),
                                    article_id: expect.any(Number),
                                    topic: "mitch",
                                    created_at: expect.any(String),
                                    votes: expect.any(Number),
                                    article_img_url: expect.any(String),
                                    comment_count: expect.any(Number),
                                });
                            });
                        });
                });

                test("200: responds with empty array if topic exists but has no articles", () => {
                    return request(app)
                        .get("/api/articles?topic=paper")
                        .expect(200)
                        .then((response) => {
                            expect(response.body.articles).toEqual([]);
                        });
                })
            });

            describe("if does not exist", () => {
                test("404: responds with error message", () => {
                    return request(app)
                        .get("/api/articles?topic=unknown")
                        .expect(404)
                        .then((response) => {
                            expect(response.body.msg).toBe("Not found");
                        })
                })
            });
        });

        describe("query: sort_by, order", () => {
            describe("if valid", () => {
                test("200: articles sorted by author (ASC) when explicitly passing sort_by=author and order=asc query", () => {
                    return request(app)
                        .get("/api/articles?sort_by=author&order=asc")
                        .expect(200)
                        .then((response) => {
                            expect(response.body.articles.length).toBe(10);
                            expect(response.body.articles).toBeSortedBy('author', {descending: false});
                        });
                });

                test("200: articles sorted by title (DESC) when explicitly passing sort_by=title and order=DESC query", () => {
                    return request(app)
                        .get("/api/articles?sort_by=title&order=DESC")
                        .expect(200)
                        .then((response) => {
                            expect(response.body.articles.length).toBe(10);
                            expect(response.body.articles).toBeSortedBy('title', {descending: true});
                        });
                });

                test("200: articles sorted by title using default order (DESC) when explicitly passing sort_by=title query", () => {
                    return request(app)
                        .get("/api/articles?sort_by=title")
                        .expect(200)
                        .then((response) => {
                            expect(response.body.articles.length).toBe(10);
                            expect(response.body.articles).toBeSortedBy('title', {descending: true});
                        });
                });

                test("200: articles default to being sorted by date (ASC) when explicitly passing order=asc query", () => {
                    return request(app)
                        .get("/api/articles?order=asc")
                        .expect(200)
                        .then((response) => {
                            expect(response.body.articles.length).toBe(10);
                            expect(response.body.articles).toBeSortedBy('created_at', {descending: false});
                        });
                });
            });

            describe("if invalid", () => {
                test("400: responds with error message if order query is invalid", () => {
                    return request(app)
                        .get("/api/articles?order=invalid")
                        .expect(400)
                        .then((response) => {
                            expect(response.body.msg).toBe("Invalid order query, order must be either 'asc' or 'desc'");
                        });
                });

                test("400: responds with error message if sort_by query is invalid", () => {
                    return request(app)
                        .get("/api/articles?sort_by=invalid")
                        .expect(400)
                        .then((response) => {
                            expect(response.body.msg).toBe("column 'invalid' does not exist");
                        });
                });
            });
        });

        describe("query: limit, p", () => {
            describe("if valid", () => {
                test("200: matches default behaviour when explicity passing limit=10 and p=1", async () => {
                    const response = await request(app).get("/api/articles?limit=10&p=1");
                    const defaultResponse = await request(app).get("/api/articles");
                    
                    expect(response.body.articles).toEqual(defaultResponse.body.articles);
                });

                test("200: returns latest article (by date) if limit=1 and p=1", () => {
                    return request(app)
                        .get("/api/articles?limit=1&p=1")
                        .expect(200)
                        .then((response) => {
                            expect(response.body.articles).toEqual([
                                {
                                    article_id: 3,
                                    title: "Eight pug gifs that remind me of mitch",
                                    topic: "mitch",
                                    author: "icellusedkars",
                                    created_at: "2020-11-03T09:12:00.000Z",
                                    votes: 0,
                                    article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                                    comment_count: 2,
                                }
                            ]);
                        });
                });

                test("200: returns all articles when limit is greater than number of articles", () => {
                    return request(app)
                        .get("/api/articles?limit=100")
                        .expect(200)
                        .then((response) => {
                            expect(response.body.articles.length).toEqual(13);
                        });
                });

                test("200: returns empty array of articles when limit is greater than number of articles and p > 1", () => {
                    return request(app)
                        .get("/api/articles?limit=100&p=2")
                        .expect(200)
                        .then((response) => {
                            expect(response.body.articles.length).toEqual(0);
                        });
                });

                test("200: returns correct array of articles when limit=2 and p=2", () => {
                    return request(app)
                        .get("/api/articles?limit=2&p=2")
                        .expect(200)
                        .then((response) => {
                            expect(response.body.articles).toEqual([
                                {
                                    article_id: 2,
                                    title: "Sony Vaio; or, The Laptop",
                                    topic: "mitch",
                                    author: "icellusedkars",
                                    created_at: "2020-10-16T05:03:00.000Z",
                                    article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                                    votes: 0,
                                    comment_count: 0,
                                  },
                                  {
                                    article_id: 13,
                                    title: "Another article about Mitch",
                                    topic: "mitch",
                                    author: "butter_bridge",
                                    created_at: "2020-10-11T11:24:00.000Z",
                                    article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                                    votes: 0,
                                    comment_count: 0,
                                  },
                            ]);
                        });
                });
            });
            
            describe("if invalid", () => {
                test("400: responds with error message if limit query is invalid", () => {
                    return request(app)
                        .get("/api/articles?limit=one")
                        .expect(400)
                        .then((response) => {
                            expect(response.body.msg).toBe("Bad request");
                        });
                });

                test("400: responds with error message if p query is invalid", () => {
                    return request(app)
                        .get("/api/articles?p=one")
                        .expect(400)
                        .then((response) => {
                            expect(response.body.msg).toBe("Bad request");
                        });
                });
            });
        });
    });

    describe("POST", () => {
        const author = "icellusedkars";
        const title = "ABC";
        const body = "The quick brown fox jumps over the lazy dog";
        const topic = "cats";
        const default_article_img_url = "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700";

        describe("if valid article", () => {
            test("201: responds with created comment", () => {
                return request(app)
                    .post("/api/articles")
                    .send({author, title, body, topic})
                    .expect(201)
                    .then((response) => {
                        expect(response.body.article).toMatchObject({
                            article_id: 14,
                            author,
                            title,
                            body,
                            topic,
                            votes: 0,
                            comment_count: 0,
                            created_at: expect.any(String),
                            article_img_url: default_article_img_url,
                        });
                    });
            });

            test("201: responds with created comment if custom article_img_url is given", () => {
                const custom_article_img_url = "https://www.this.com/pic.jpg";
                return request(app)
                    .post("/api/articles")
                    .send({author, title, body, topic, article_img_url: "https://www.this.com/pic.jpg"})
                    .expect(201)
                    .then((response) => {
                        expect(response.body.article.article_img_url).toBe("https://www.this.com/pic.jpg");
                    });
            });

            test("201: ignores unnecessary properties on comment body", () => {
                return request(app)
                    .post("/api/articles")
                    .send({author, title, body, topic, prop: 'ignored'})
                    .expect(201)
                    .then((response) => {
                        expect(response.body.article).toMatchObject({
                            article_id: 14,
                            author,
                            title,
                            body,
                            topic,
                            votes: 0,
                            comment_count: 0,
                            created_at: expect.any(String),
                            article_img_url: default_article_img_url,
                        });
                    });
            });

            test("404: author does not match any existing users(username)", () => {
                return request(app)
                    .post("/api/articles")
                    .send({author: "user404", title, body, topic})
                    .expect(404)
                    .then((response) => {
                        expect(response.body.msg).toBe("Author not found");
                    });
            });

            test("404: topic does not match any existing topics(slug)", () => {
                return request(app)
                    .post("/api/articles")
                    .send({author, title, body, topic: "topic404"})
                    .expect(404)
                    .then((response) => {
                        expect(response.body.msg).toBe("Topic not found");
                    });
            });
        });

        describe("if invalid article", () => {
            test("400: responds with error message if author is missing", () => {
                return request(app)
                    .post("/api/articles")
                    .send({title, body, topic})
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });

            test("400: responds with error message if title is missing", () => {
                return request(app)
                    .post("/api/articles")
                    .send({author, body, topic})
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });

            test("400: responds with error message if body is missing", () => {
                return request(app)
                    .post("/api/articles")
                    .send({author, title, topic})
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });

            test("400: responds with error message if topic is missing", () => {
                return request(app)
                    .post("/api/articles")
                    .send({author, title, body})
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });

            test("400: responds with error message if invalid article_img_url", () => {
                return request(app)
                    .post("/api/articles")
                    .send({author, title, body, topic, article_img_url: 666})
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            });

            test("400: responds with error message if invalid author", () => {
                return request(app)
                    .post("/api/articles")
                    .send({author: 400, title, body, topic})
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
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
                            comment_count: 11,
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
    });

    describe("DELETE", () => {
        describe("if valid article_id", () => {
            test("204: successfully removes article", async () => {
                {
                    const response = await request(app).delete("/api/articles/1");
                    expect(response.statusCode).toBe(204);
                    expect(response.body).toEqual({});

                    const articleResponse = await request(app).get("/api/articles/1");
                    expect(articleResponse.statusCode).toBe(404);
                    expect(articleResponse.body.msg).toBe("Article not found");

                    const commentsResponse = await request(app).get("/api/articles/1/comments");
                    expect(commentsResponse.statusCode).toBe(404);
                    expect(commentsResponse.body.msg).toBe("Article not found");
                }

                {
                    const response = await request(app).delete("/api/articles/1");
                    expect(response.statusCode).toBe(404);
                    expect(response.body.msg).toBe("Article not found");
                }
            });

            test("404: responds with error message if no article exists with given article_id", () => {
                return request(app)
                    .delete("/api/articles/99")
                    .expect(404)
                    .then((response) => {
                        expect(response.body.msg).toBe("Article not found");
                    });
            })
        });

        describe("if invalid article_id", () => {
            test("400: responds with error message", () => {
                return request(app)
                    .delete("/api/articles/invalid")
                    .expect(400)
                    .then((response) => {
                        expect(response.body.msg).toBe("Bad request");
                    });
            })
        })
    });
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
                        expect(comments.length).toBe(10);

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

            test("200: comments by default are sorted by most recent comments first (DESC)", () => {
                return request(app)
                    .get("/api/articles/1/comments")
                    .expect(200)
                    .then((response) => {
                        expect(response.body.comments).toBeSortedBy('created_at', {descending: true});
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

            describe("query: limit, p", () => {
                describe("if valid", () => {
                    test("200: matches default behaviour when explicity passing limit=10 and p=1", async () => {
                        const response = await request(app).get("/api/articles/1/comments?limit=10&p=1");
                        const defaultResponse = await request(app).get("/api/articles/1/comments");
                        
                        expect(response.body.comments).toEqual(defaultResponse.body.comments);
                    });
    
                    test("200: returns most recent comment (by date) if limit=1 and p=1", () => {
                        return request(app)
                            .get("/api/articles/1/comments?limit=1&p=1")
                            .expect(200)
                            .then((response) => {
                                expect(response.body.comments).toEqual([
                                    {
                                        article_id: 1,
                                        author: "icellusedkars",
                                        body: "I hate streaming noses",
                                        comment_id: 5,
                                        votes: 0,
                                        created_at: "2020-11-03T21:00:00.000Z",
                                    }
                                ]);
                            });
                    });
    
                    test("200: returns all comments when limit is greater than number of comments", () => {
                        return request(app)
                            .get("/api/articles/1/comments?limit=100")
                            .expect(200)
                            .then((response) => {
                                expect(response.body.comments.length).toEqual(11);
                            });
                    });
    
                    test("200: returns empty array of comments when limit is greater than number of comments and p > 1", () => {
                        return request(app)
                            .get("/api/articles/1/comments?limit=100&p=2")
                            .expect(200)
                            .then((response) => {
                                expect(response.body.comments.length).toEqual(0);
                            });
                    });
    
                    test("200: returns correct array of comments when limit=2 and p=2", () => {
                        return request(app)
                            .get("/api/articles/1/comments?limit=2&p=2")
                            .expect(200)
                            .then((response) => {
                                expect(response.body.comments).toEqual([
                                    {
                                        comment_id: 18,
                                        body: "This morning, I showered for nine minutes.",
                                        votes: 16,
                                        author: "butter_bridge",
                                        article_id: 1,
                                        created_at: "2020-07-21T00:20:00.000Z",
                                    },
                                    {
                                        comment_id: 13,
                                        body: "Fruit pastilles",
                                        votes: 0,
                                        author: "icellusedkars",
                                        article_id: 1,
                                        created_at: "2020-06-15T10:25:00.000Z",
                                    },
                                ]);
                            });
                    });
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