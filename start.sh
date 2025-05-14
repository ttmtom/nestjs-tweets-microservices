# infrastructure setup
echo "Starting Docker Compose services..."
docker-compose up -d

# application setup
yarn install

echo "run db migrations"
