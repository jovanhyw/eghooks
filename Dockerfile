FROM gdssingapore/airbase:node-22
WORKDIR /app
COPY . ./
EXPOSE 4321
USER app
CMD ["node", "index.js"]
