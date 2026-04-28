
import Counter from "../models/Counter.js";

async function getNextUid() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "userId" },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true
    }
  );

  return counter.seq;
}

// Export as default so you can import like:
// import getNextUid from "../middleware/getNextUid.js";
export default getNextUid;
