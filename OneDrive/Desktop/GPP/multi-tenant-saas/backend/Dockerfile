FROM node:18

WORKDIR /app

# copy backend files
COPY backend/package*.json ./
RUN npm install

COPY backend ./

# copy database migrations
COPY database ./database

EXPOSE 5000

CMD ["npm", "start"]
