ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apk add --no-cache \
    npm \
    nodejs \
    $BUILD_FROM

WORKDIR /usr/app

COPY run.sh /usr/app/run.sh
COPY rootfs/*.js /usr/app/
COPY rootfs/package.json /usr/app/package.json

RUN chmod a+x /usr/app/run.sh

CMD [ "/usr/app/run.sh" ]
