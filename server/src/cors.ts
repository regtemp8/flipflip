import cors from "cors";

export default cors({
  origin: "http://localhost:5173",
  credentials: true,
});
