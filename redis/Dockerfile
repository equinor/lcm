FROM dhi.io/redis:7.4.7-debian13-compat
# Redis 8.4 (and later) are not available on DHI yet, so we use the last open source release

ENV USER="nonroot"

COPY --chown="$USER:$USER" rootfs /

ENTRYPOINT ["tini", "--", "entrypoint.sh"]
HEALTHCHECK --start-interval=0.5s --start-period=5s CMD ["healthcheck.sh"]