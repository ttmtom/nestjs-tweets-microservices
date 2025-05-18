# application setup
# setup stage
npm install

# test stage
npm run test
if [ $? -ne 0 ]; then
  echo "Tests failed. Exiting."
  exit 1
fi

# build
npm run build

# start db instances
echo "Starting Docker Compose services..."
docker-compose up -d

# run stage
npm run start:all
