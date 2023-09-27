FROM alpine:3.18

WORKDIR /project/

RUN apk add nodejs npm

COPY --chown=root:root --chmod=755 entrypoint /run/

ENTRYPOINT [ "/run/entrypoint" ]
