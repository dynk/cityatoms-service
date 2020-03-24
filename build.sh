  
#!/bin/bash
echo "Deploying..."
export PORT=3000
export MONGODB_URI=mongo
export LOG_LEVEL=info
export AUTH_TOKEN=test
export BACKOFFICE_AUTH_TOKEN=test
docker-compose up --build

