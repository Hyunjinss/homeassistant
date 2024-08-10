ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apk add --no-cache \
    npm \
    nodejs 

COPY package.json /
COPY *.js /
COPY run.sh /
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]
