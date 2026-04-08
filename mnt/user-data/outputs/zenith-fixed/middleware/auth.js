const isAuthenticated = (req, res, next) => {
   if (req.session?.userId) return next();
   res.status(401).json({ error: 'Not authenticated.' });
};

const isAdmin = (req, res, next) => {
   if (req.session?.role === 'admin') return next();
   res.status(403).json({ error: 'Forbidden. Authorized only.' });
}

module.exports = { isAuthenticated, isAdmin };

