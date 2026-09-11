export const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });
export const fail = (res, status, message, code = "REQUEST_FAILED") =>
  res.status(status).json({ success: false, message, code });
