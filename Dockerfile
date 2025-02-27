FROM node:20

RUN apt-get update && apt-get install -y bash netcat-openbsd

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 4200

CMD ["npm", "run", "start:dev"]