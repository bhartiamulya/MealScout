module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const payload = {
    error: err.message || 'Unexpected error'
  };

  if (err.details) {
    payload.details = err.details;
  }

  res.status(status).json(payload);
};
