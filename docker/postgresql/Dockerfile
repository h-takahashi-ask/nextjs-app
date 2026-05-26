FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PG_MAJOR=16

RUN apt-get update && apt-get install -y \
    curl \
    wget \
    tzdata \
    postgresql-${PG_MAJOR} \
    postgresql-client-${PG_MAJOR} \
    postgresql-contrib-${PG_MAJOR} \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# タイムゾーン設定（rootで実行が必要）
RUN ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
    && echo "Asia/Tokyo" > /etc/timezone

ENV TZ=Asia/Tokyo
ENV PGDATA=/var/lib/postgresql/data

RUN mkdir -p "$PGDATA" /docker-entrypoint-initdb.d \
    && chown -R postgres:postgres "$PGDATA" /docker-entrypoint-initdb.d

COPY files/etc/postgresql/postgresql.conf /etc/postgresql/postgresql.conf
COPY files/etc/postgresql/pg_hba.conf /etc/postgresql/pg_hba.conf
COPY files/ddl/ /docker-entrypoint-initdb.d/ddl/
COPY files/data/ /docker-entrypoint-initdb.d/data/
COPY files/usr/local/bin/entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV PATH="/usr/lib/postgresql/${PG_MAJOR}/bin:$PATH"

USER postgres

EXPOSE 5432

ENTRYPOINT ["docker-entrypoint.sh"]
