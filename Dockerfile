FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# Start the bot
CMD ["sh", "-c", "npx prisma db push --accept-placeholder-creator && npm run seed && npm run start"]
