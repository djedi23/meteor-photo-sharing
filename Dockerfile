FROM node:0.10.40

MAINTAINER moise.valvassori@gmail.com

RUN apt-get update && \
    apt-get install -y netcat graphicsmagick libexiv2-dev exiv2 && \
    apt-get autoremove && \
    apt-get clean

RUN ln -sf /usr/lib/x86_64-linux-gnu/libexiv2.so.13 /usr/lib/x86_64-linux-gnu/libexiv2.so.12

WORKDIR /opt/bundle/
# ENV MONGO_URL mongodb://$MONGO_PORT_27017_TCP_ADDR:$MONGO_PORT_27017_TCP_PORT/meteor
# ENV MONGO_OPLOG_URL mongodb://$MONGO_PORT_27017_TCP_ADDR:$MONGO_PORT_27017_TCP_PORT/local
ENV MONGO_URL mongodb://mongo:27017/meteor
ENV MONGO_OPLOG_URL mongodb://mongo:27017/local
ENV PORT 3000


ADD app.tar.gz /opt/
#RUN (cd /opt/bundle/programs/server && rm -rf npm/npm-bcrypt && npm install bcrypt && npm install && rm -rf /tmp/*)
RUN (cd /opt/bundle/programs/server && npm install && rm -rf /tmp/*)
ADD _docker/wait_containers /opt/bundle/

ENV ROOT_URL https://albums.valvassori.info/

EXPOSE 3000
CMD /opt/bundle/wait_containers && node main.js --raw-logs

