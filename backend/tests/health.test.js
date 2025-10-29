const axios = require("axios");

test("backend API /health is working", async () => {
  const res = await axios.get("http://localhost:5000/health");
  expect(res.status).toBe(200);
  expect(res.data.status).toBe("healthy");
});
