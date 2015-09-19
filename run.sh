#!/bin/bash

IP_ADDRESS="$(wget -qO- http://ipecho.net/plain ; echo)"

export PORT="80"
export NODE_ENV="production"

echo "IP Address: $IP_ADDRESS"

forever start ./bin/www

