FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . . 

RUN npm run build  # Убеждаемся, что build выполняется во время сборки контейнера
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]



