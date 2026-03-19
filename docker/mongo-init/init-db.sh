#!/bin/bash
set -e

mongosh <<EOF
use ${MONGO_APP_DATABASE}

db.createUser({
  user: "${MONGO_APP_USER}",
  pwd: "${MONGO_APP_PASSWORD}",
  roles: [
    { role: "readWrite", db: "${MONGO_APP_DATABASE}" }
  ]
})

db.createCollection("products")
db.createCollection("orders")

print("✅ Base de datos '${MONGO_APP_DATABASE}' inicializada correctamente")
EOF