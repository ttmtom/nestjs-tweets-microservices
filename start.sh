# start db instances
echo "Starting Docker Compose services..."
docker-compose up -d

# application setup
npm install

npm run build

# @TODO migration stage
# setup flyway migration scripts
# replace the docker-compose docker-entrypoint-initdb.d start.sql

