FROM nginx:alpine
ARG UID=1000
ARG GID=1000
RUN addgroup -S usergroup -g $GID && adduser -u $UID -S nonrootuser -G usergroup \
    && mkdir -p /var/run/nginx /var/tmp/nginx \
    && chown -R nonrootuser /usr/share/nginx /var/run/nginx /var/tmp/nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.nginx /etc/nginx/conf.d/default.conf
USER nonrootuser

