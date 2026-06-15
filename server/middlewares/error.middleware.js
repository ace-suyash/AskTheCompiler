export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV !== 'production') {
    console.error(`\nError [${statusCode}]: ${err.message}`);
    if (statusCode === 500) console.error(err.stack);
  }

  if (err.code === 11000) { // duplicate error code
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `That ${field} is already in use. Please choose another.`,
    });
  }

  if (err.name === 'ValidationError') { // missing data field
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. '),
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong on the server',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }), // !! reminder : remember to remove before deplpoying
  });
};
