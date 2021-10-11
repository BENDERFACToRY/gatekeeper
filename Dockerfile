FROM node

COPY dist /app/dist

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

RUN npm ci --production

CMD ["node", "."]