FROM node:18-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# Default environment variables
ENV DATABASE_URL="file:./dev.db"

# Start the bot
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run seed && npm run start"]
