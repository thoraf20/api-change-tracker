import app from "./app";

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Backend] API Change Tracker running on port ${PORT}`);
});
