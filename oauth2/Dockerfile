FROM dhi.io/oauth2-proxy:7.14.2-debian13

COPY oauth2-proxy.toml /etc/
COPY oauth2-proxy.yaml /etc/

CMD ["--config", "/etc/oauth2-proxy.toml", "--alpha-config", "/etc/oauth2-proxy.yaml"]
