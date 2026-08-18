db = db.getSiblingDB('ecbr');

db.createUser({
  user: 'toop_app',
  pwd: 'toop_app_dev_password',
  roles: [
    { role: 'readWrite', db: 'ecbr' }
  ]
});

db.createCollection('users');
db.createCollection('companies');
db.createCollection('orders');
db.createCollection('deliverymen');
db.createCollection('payments');
db.createCollection('notifications');

print('MongoDB initialized: database=ecbr, user=toop_app created');
