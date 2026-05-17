db.createUser({
    user: 'vlad',
    pwd: 'vlad',
    roles: [
        {
            role: 'readWrite',
            db: 'nodejs-express'
        }
    ]
});