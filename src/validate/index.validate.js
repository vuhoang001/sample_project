const { validationResult } = require("express-validator");

const validate = validations => {
    return async (req, res, next) => {
      
      for (const validation of validations) {
        const result = await validation.run(req);
        if (!result.isEmpty()) {
          return res.status(400).json({ errors: result.array() });
        }
      }
      next();
    };
  };

module.exports = { handleValidationErrors };
