const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');  // You may want to switch to an external DB for persistence
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, user-id'
    );
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);  // Handle preflight requests
    }
    next();
});

// Middleware for permission validation
server.use((req, res, next) => {
    const db = router.db;
    const users = db.get('users').value();
    const roles = db.get('roles').value();
    const permissions = db.get('permissions').value();

    const userId = req.headers['user-id'];
    const user = users.find((u) => u.id === userId);

    if (!user) {
        return res.status(403).json({ error: 'User not found' });
    }

    const role = roles.find((r) => r.id === user.role);
    const allowedPermissions = role ? role.permissions : [];

    const permissionNeeded = req.method === 'GET' ? '1' : req.method === 'POST' ? '2' : '3';
    if (!allowedPermissions.includes(permissionNeeded)) {
        return res.status(403).json({ error: 'Permission denied' });
    }

    next();
});

// Export as Vercel Serverless Function handler
module.exports = (req, res) => {
    server(req, res);  // Pass request and response to the server
};
