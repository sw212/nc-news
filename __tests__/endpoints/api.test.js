const request = require("supertest");
const app = require("../../app");
const fs  = require("fs/promises");

describe("/api", () => {
    describe("GET", () => {
        test("200: responds with an object describing all the available API endpoints", async () => {
            const response = await request(app).get("/api");
            expect(response.statusCode).toBe(200);

            const expectedResponse = JSON.parse(await fs.readFile("endpoints.json", "utf-8"));
            expect(response.body.api).toEqual(expectedResponse);
        });
    });
});