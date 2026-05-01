#!/bin/bash
# vento Enterprise - Database Setup Script
# Run this with: sudo -u postgres bash setup-db.sh

echo "=== vento Enterprise Database Setup ==="

# Create user if not exists
psql -tc "SELECT 1 FROM pg_roles WHERE rolname='vento'" | grep -q 1 || \
    psql -c "CREATE USER vento WITH PASSWORD 'password';"

# Create database if not exists
psql -tc "SELECT 1 FROM pg_database WHERE datname='vento_db'" | grep -q 1 || \
    psql -c "CREATE DATABASE vento_db OWNER vento;"

# Grant privileges
psql -c "GRANT ALL PRIVILEGES ON DATABASE vento_db TO vento;"

# Allow password login for vento user
# Add to pg_hba.conf if needed:
# host    vento_db   vento      127.0.0.1/32    md5

echo ""
echo "=== Setup Complete ==="
echo "Database: vento_db"
echo "User: vento"
echo "Password: password"
echo "Connection: jdbc:postgresql://localhost:5432/vento_db"
echo ""
echo "To start the backend:"
echo "  cd backend && mvn spring-boot:run"
echo ""
echo "To start the frontend:"
echo "  cd frontend && npm run dev"
