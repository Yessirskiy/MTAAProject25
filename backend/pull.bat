@echo off
echo Pulling latest changes from GIT
git pull origin main

echo Running Alembic migrations
alembic upgrade head

