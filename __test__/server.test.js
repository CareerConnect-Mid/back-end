const { server } = require("../src/server");
const supertest = require("supertest");
const mockServerMethods = supertest(server);
const { db } = require("../src/models/index");
const { userModel, notificationModel,friends ,friendRequests } = require("../src/models/index"); // Update the path if needed

beforeAll(async () => {
  await db.sync();
  
});
afterAll(async () => {
  await db.drop();
});
const bearerToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vdGEiLCJpZCI6MSwiaWF0IjoxNjkxMzkzNjAzfQ.OSYAPlVOPEullhNXdeZleKFPjb0v9aZvUgdFnEHO-iw";
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
    test("should get all users", async () => {
      try {
        // Authenticate a user to obtain a token
        const user = await userModel.authenticateToken(bearerToken);

        if (!user) {
          console.error("User authentication failed.");
          return;
        }

        const token = user.token;

        const response = await mockServerMethods
          .get("/users")
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200); // Update the expected status code
        // Add your assertions for response.body here based on your model structure
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    });

    // Add more tests for edge cases and error handling if needed
  });

  describe("POSTS /routes", () => {
    test("should create a new post", async () => {
      try {
        // Authenticate a user to obtain a token
        const user = await userModel.authenticateToken(bearerToken);

        if (!user) {
          console.error("User authentication failed.");
          return;
        }

        const token = user.token;

        const requestBody = {
          paragraph_conent: "this is a new post",
        };

        const response = await mockServerMethods
          .post("/career/posts")
          .set("Authorization", `Bearer ${token}`)
          .send(requestBody);

        expect(response.status).toBe(201); // Expect the status code for successful creation
        // Add assertions for the response body based on your model structure
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    });

    test("should update a post", async () => {
      try {
        // Authenticate a user to obtain a token
        const user = await userModel.authenticateToken(bearerToken);

        if (!user) {
          console.error("User authentication failed.");
          return;
        }

        const token = user.token;

        // Create a new record first
        const newRecord = await db.models.posts.create({
          user_id: user.id,
          paragraph_content: "Initial content",
          photo_content: "photo.jpg",
          status: "draft",
        });

        const updatedData = {
          paragraph_content: "Updated content",
          photo_content: "updated_photo.jpg",
          status: "public",
        };

        const response = await mockServerMethods
          .put(`/career/update/${newRecord.id}`)
          .set("Authorization", `Bearer ${token}`)
          .send(updatedData);

        expect(response.status).toBe(200);
        expect(response.body.paragraph_content).toBe(
          updatedData.paragraph_content
        );
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    });

    describe("DELETE /posts/:id", () => {
      test("should delete a post by ID and check if the model is empty", async () => {
        try {
          // Authenticate a user to obtain a token
          const user = await userModel.authenticateToken(bearerToken);

          if (!user) {
            console.error("User authentication failed.");
            return;
          }

          const token = user.token;

          // Create a sample post to delete
          const newPost = await postsModel.create({
            user_id: user.id,
            paragraph_content: "Sample content",
            photo_content: "sample-photo.jpg",
            status: "published",
          });

          const response = await mockServerMethods
            .delete(`/career/posts/${newPost.id}`)
            .set("Authorization", `Bearer ${token}`);

          expect(response.status).toBe(200); // Update the expected status code
          // Add your assertions for response.body here

          // Check if the model is empty by retrieving all posts
          const allPostsAfterDeletion = await postsModel.findAll();
          expect(allPostsAfterDeletion).toEqual([]);
        } catch (error) {
          console.error("Error:", error);
          throw error;
        }
      });
    });
  });
  describe("GET /usernotification", () => {
    test("should get user notifications", async () => {
      const userId = 1; // Replace with the user ID you want to use for testing
      const fakeNotifications = [
        // Replace with your example notifications data
        { id: 1, message: "Notification 1" },
        { id: 2, message: "Notification 2" },
      ];

      // Mock the userModel.authenticateToken function
      userModel.authenticateToken = jest
        .fn()
        .mockResolvedValue({ id: userId, token: bearerToken });

      // Mock the notificationModel findAll function
      notificationModel.findAll = jest
        .fn()
        .mockResolvedValue(fakeNotifications);

      const response = await mockServerMethods
        .get("/career/usernotification")
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(fakeNotifications);
    });
  });

});
