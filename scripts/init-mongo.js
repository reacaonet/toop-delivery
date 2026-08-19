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

// OTA Database
var otaDb = db.getSiblingDB('toop_ota');
otaDb.createUser({
  user: 'ota_user',
  pwd: 'ota_pass',
  roles: [
    { role: 'readWrite', db: 'toop_ota' }
  ]
});
otaDb.createCollection('updates');
print('MongoDB initialized: database=toop_ota, user=ota_user created');
