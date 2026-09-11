import { fail } from "../utils/response.js";
export function notFound(_req, res) {
  return fail(res, 404, "The requested resource was not found.", "NOT_FOUND");
}
export function errorHandler(error, _req, res, _next) {
  if (error?.code === 11000)
    return fail(res, 409, "That record already exists.", "DUPLICATE_RECORD");
  console.error("Unhandled API error:", error.message);
  return fail(
    res,
    500,
    "Something went wrong on our side. Please try again.",
    "INTERNAL_ERROR",
  );
}
