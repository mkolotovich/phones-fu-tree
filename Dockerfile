FROM node:18-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY components ./components
COPY css ./css
COPY images ./images
COPY lib ./lib
COPY models ./models
COPY pages ./pages
COPY public ./public

RUN npm run build

CMD ["npm", "start"]
