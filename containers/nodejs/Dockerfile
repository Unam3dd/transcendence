FROM node:20.11.1-bookworm-slim
WORKDIR /project/
RUN apt-get update && apt-get upgrade -y && apt-get install netcat-openbsd -y
RUN npm update -g && npm upgrade -g && npm i -g @angular/cli && npm i -g @nestjs/cli
COPY --chown=root:root --chmod=755 entrypoint /run/
STOPSIGNAL SIGTERM
ENTRYPOINT [ "/run/entrypoint" ]
