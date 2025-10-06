// /api/download-center.js
export default async function handler(req, res) {
  const { user_id } = req.query;

  const r = await fetch(
    `https://qunatum-tour.onrender.com/api/client/download-center?user_id=${encodeURIComponent(user_id)}`,
    {
      headers: {
        Authorization: req.headers.authorization || "",
        "Content-Type": "application/json",
      },
    }
  );

  const text = await r.text();
  res.status(r.status).send(text);
}
