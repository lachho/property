#!/bin/bash

echo "Stopping PostgreSQL container..."
docker stop postgres || true


echo "Removing PostgreSQL container..."
docker rm postgres || true


echo "Starting new PostgreSQL container..."
docker run --name postgres -e POSTGRES_DB=property_db -e POSTGRES_USER=property_user -e POSTGRES_PASSWORD=property_pass -p 5432:5432 -d postgres:15


echo "Waiting for PostgreSQL to start..."
sleep 5

echo "PostgreSQL container restarted!"
