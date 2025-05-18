# application setup
npm install

npm run test

npm run build

# start db instances
echo "Starting Docker Compose services..."
docker-compose up -d

npm run start:all