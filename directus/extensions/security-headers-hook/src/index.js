export default ({ init }) => {
  init('routes.before', ({ app }) => {
    app.use((req, res, next) => {
      if (req.headers.authorization || req.query.access_token) {
        const originalWriteHead = res.writeHead;
        res.writeHead = function (statusCode, ...args) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          return originalWriteHead.call(this, statusCode, ...args);
        };
      }
      next();
    });
  });
};
