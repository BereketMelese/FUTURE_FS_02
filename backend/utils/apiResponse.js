export const sendError = (res, status, code, message, details) =>
  res.status(status).json({
    success: false,
    code,
    message,
    ...(details ? { details } : {}),
  });

export const sendValidationError = (res, errors) =>
  sendError(res, 400, "VALIDATION_ERROR", "Validation failed", {
    errors: errors.array(),
  });