const request = require("supertest");
const app = require("../app");

test("404: GET should return 'Not found' for non-existant endpoint", () => {
    return request(app)
        .get("/api/doesnotexist")
        .expect(404)
        .then((response) => {
            expect(response.body.msg).toBe("Not found");
        });
});