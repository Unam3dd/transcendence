FROM snyk/snyk:alpine
WORKDIR /project/
COPY --chown=root:root ./test.sh /run/
RUN chmod 777 /run/test.sh
ENTRYPOINT [ "/run/test.sh" ]