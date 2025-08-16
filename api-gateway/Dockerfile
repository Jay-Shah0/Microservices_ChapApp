# Use the official stable and lightweight Nginx image from Docker Hub
FROM nginx:stable-alpine

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom nginx configuration file into the container
COPY nginx.conf /etc/nginx/conf.d/default.conf