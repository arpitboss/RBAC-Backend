const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);
const cors = require('cors');
server.use(cors());
server.use((req, res, next) => {
    const db = router.db;
    const users = db.get('users').value();
    const roles = db.get('roles').value();
    const permissions = db.get('permissions').value();

    const userId = req.headers['user-id'];
    console.log(userId);
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

server.use(router);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
});
