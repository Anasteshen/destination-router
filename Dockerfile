FROM node:21-alpine AS builder
WORKDIR /app
COPY ./package*.json ./
RUN npm ci
COPY ./ ./
EXPOSE 3000
RUN npm run build

FROM node:20.9.0-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
USER node
CMD ["node", "--unhandled-rejections=strict", "./build/index.js"]
