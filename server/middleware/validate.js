import { fail } from "../utils/response.js";
export const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success)
    return fail(
      res,
      422,
      parsed.error.issues[0]?.message || "Invalid request.",
      "VALIDATION_ERROR",
    );
  req.body = parsed.data;
  next();
};
