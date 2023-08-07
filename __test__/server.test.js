const { server } = require("../src/server");
const supertest = require("supertest");
const mockServerMethods = supertest(server);
const { db } = require("../src/models/index");



beforeAll(async () => {
  await db.sync();
});

afterAll(async () => {
  await db.drop();
});

describe("Authentication Routes", () => {
  describe("POST /signup", () => {
    test("should create a new user", async () => {
      const response = await mockServerMethods
        .post("/signup")
        .send({ username: "testuser", password: "password123", role: "user" });

      expect(response.status).toBe(201);
      expect(response.body.user).toBe("testuser");
      expect(response.body.role).toBe("user");
    });

    // Add more tests for edge cases and error handling if needed
  });

  describe("POST /signin", () => {
    test("should sign in a user with valid credentials", async () => {
      const response = await mockServerMethods
        .post("/signin")
        .auth("testuser", "password123");

      expect(response.status).toBe(200);
      expect(response.body.username).toBe("testuser");
      expect(response.body).toHaveProperty("token");
      expect(response.body.role).toBe("user");
    });

    // Add more tests for edge cases and error handling if needed
  });

  describe("GET /users", () => {
    test("should return a list of users with delete permissions", async () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFnZyIsImlkIjo3LCJpYXQiOjE2OTEzMTkxODB9.87kND7EbYkAdFbuJQBZtuidMNCErO5Yyx7O3xL3QVOk"; // Replace with a valid bearer token
      const response = await mockServerMethods
        .get("/users")
        .set("Authorization", `Bearer ${token}`);
  
      console.log("Response status: --------------------------------------", response.status);
      console.log("Response body: ----------------------------------------------", response.body);
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.arrayContaining([
        "esraaa",
        "ana",
        "hh",
        "hha",
        "ahh",
        "agg"
      ]));
    });
  
  });
  

  describe("POST /logout", () => {
    test("should log out a user and blacklist the token", async () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImVzcmFhYSIsImlkIjoxLCJpYXQiOjE2OTEzMDYwOTd9.BSyt591hbi-VrdT-QhQul6wDhhEU4gOiS8QTk9VDcyU"; // Replace with a valid bearer token
      const response = await mockServerMethods
        .post("/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logout successful");
    });

    // Add more tests for edge cases and error handling if needed
  });
});
