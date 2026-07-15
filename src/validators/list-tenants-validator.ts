import { checkSchema } from "express-validator";

export default checkSchema({
  q: {
    trim: true,
    customSanitizer: {
      options: (value: unknown) => {
        return value || "";
      },
    },
  },
  currentPage: {
    customSanitizer: {
      options: (value) => {
        const parsedValue = Number(value);
        return Number.isNaN(parsedValue) ? 1 : parsedValue;
      },
    },
  },
});
