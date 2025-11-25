const validate = (schema) => async (req, res, next) => {
  try {
    req.validated = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  } catch (error) {
    next({ status: 422, message: 'Validation failed', details: error.errors });
  }
};

module.exports = validate;
