FROM node:11-alpine as builder

# minimal apk dependencies to be safe
ENV PACKAGES="curl ca-certificates" \
    NODE_ENV="production" \
    HOST="0.0.0.0:5000"

WORKDIR /usr/build

COPY package*.json yarn.lock ./

RUN apk add --no-cache $PACKAGES && yarn install --production=false

COPY . .

RUN yarn build

# Run as non-root user for security
# USER 1000

# Expose app port (5000/tcp)
EXPOSE 5000

CMD ["yarn", "start"]
