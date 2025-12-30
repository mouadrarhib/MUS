export const successResponse = (res, message, data = {}, status = 200) =>
  res.status(status).json({ success: true, message, data });

export const errorResponse = (res, message, status = 400, details) =>
  res.status(status).json({ success: false, message, ...(details ? { details } : {}) });
