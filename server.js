const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, user-id'
    ); // Include necessary headers
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow HTTP methods
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200); // Quickly handle preflight requests
    }
    next();
});


// Middleware for permission validation
server.use((req, res, next) => {
    const db = router.db; // Get lowdb instance
    const users = db.get('users').value();
    const roles = db.get('roles').value();
    const permissions = db.get('permissions').value();

    // Get user from request headers (simulate authentication)
    const userId = req.headers['user-id']; // Pass user ID in headers
    const user = users.find((u) => u.id === userId);

    if (!user) {
        return res.status(403).json({ error: 'User not found' });
    }

    // Fetch role and permissions for the user
    const role = roles.find((r) => r.id === user.role);
    const allowedPermissions = role ? role.permissions : [];

    // Restrict access based on permissions
    const permissionNeeded = req.method === 'GET' ? '1' : req.method === 'POST' ? '2' : '3'; // Example
    if (!allowedPermissions.includes(permissionNeeded)) {
        return res.status(403).json({ error: 'Permission denied' });
    }

    next();
});

server.use(router);

// Use the dynamic PORT variable provided by hosting platforms
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
});
