#!/bin/sh
set -e

# Substitute API_TOKEN in nginx config template
export API_TOKEN="${API_TOKEN:-}"
envsubst '$API_TOKEN' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g "daemon off;"