#!/bin/bash
set -e

POSTGRES_USER="${POSTGRES_USER}"
POSTGRES_DB="${POSTGRES_DB}"
POSTGRES_SCHEMA="${POSTGRES_SCHEMA}"
INIT_DIR="/docker-entrypoint-initdb.d"

log() {
    echo "$(date "+%Y/%m/%d %H:%M:%S") [Entrypoint] $*"
}

log "セットアップ開始"
log "PGDATA         = $PGDATA"
log "POSTGRES_USER  = $POSTGRES_USER"
log "POSTGRES_DB    = $POSTGRES_DB"

if [ ! -f "$PGDATA/PG_VERSION" ]; then

    ############################################################################
    # initdb
    ############################################################################
    log "initdb 開始"

    PWFILE=$(mktemp)
    echo "$POSTGRES_PASSWORD" > "$PWFILE"

    initdb \
        -D "$PGDATA" \
        --username="$POSTGRES_USER" \
        --pwfile="$PWFILE" \
        --encoding=UTF8 \
        --locale=C

    rm -f "$PWFILE"
    log "initdb 完了"

    # 初期化スクリプト実行のためにUnixソケットのみで一時起動
    log "PostgreSQL 一時起動（初期化用）"
    pg_ctl -D "$PGDATA" -o "-c listen_addresses=''" -w start

    ############################################################################
    # DB作成
    ############################################################################
    if [ "$POSTGRES_DB" != "$POSTGRES_USER" ]; then
        log "DB作成「$POSTGRES_DB」"
        createdb --username="$POSTGRES_USER" "$POSTGRES_DB"
    fi

    ############################################################################
    # 拡張機能インストール
    ############################################################################
    log "拡張機能インストール（pgcrypto）"
    psql -v ON_ERROR_STOP=1 \
         --username="$POSTGRES_USER" \
         --dbname="$POSTGRES_DB" \
         -c "CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA public;"

    ############################################################################
    # スキーマ作成
    ############################################################################
    if [ -n "$POSTGRES_SCHEMA" ]; then
        log "スキーマ作成「$POSTGRES_SCHEMA」"
        psql -v ON_ERROR_STOP=1 \
             --username="$POSTGRES_USER" \
             --dbname="$POSTGRES_DB" \
             -c "CREATE SCHEMA IF NOT EXISTS $POSTGRES_SCHEMA;"
        log "スキーマ作成完了"
    fi

    ############################################################################
    # DDL実行（ddl/ 配下の .sql を再帰的に実行）
    ############################################################################
    log "DDL実行開始"
    while IFS= read -r -d '' f; do
        log "DDL実行ファイル「$f」"
        psql -v ON_ERROR_STOP=1 \
             --username="$POSTGRES_USER" \
             --dbname="$POSTGRES_DB" \
             -f "$f"
    done < <(find "$INIT_DIR/ddl" -name "*.sql" -type f -print0 2>/dev/null | sort -z)
    log "DDL実行終了"

    ############################################################################
    # データ投入（data/ 配下の .csv / .sql を順次実行）
    ############################################################################
    log "データ投入開始"
    while IFS= read -r -d '' f; do
        log "データ投入（SQL）「$f」"
        psql -v ON_ERROR_STOP=1 \
             --username="$POSTGRES_USER" \
             --dbname="$POSTGRES_DB" \
             -f "$f"
    done < <(find "$INIT_DIR/data" -name "*.sql" -type f -print0 2>/dev/null | sort -z)
    log "データ投入終了"

    ############################################################################
    # シェルスクリプト実行（*.sh）
    ############################################################################
    log "初期化スクリプト実行開始"
    while IFS= read -r -d '' f; do
        log "スクリプト実行「$f」"
        bash "$f"
    done < <(find "$INIT_DIR" -maxdepth 1 -name "*.sh" -type f -print0 2>/dev/null | sort -z)
    log "初期化スクリプト実行終了"

    ############################################################################
    # 一時停止
    ############################################################################
    log "PostgreSQL 一時停止"
    pg_ctl -D "$PGDATA" -m fast -w stop

    log "セットアップ終了 — Ready for start up."
else
    log "既存データ検出（initdb スキップ）"
fi

log "PostgreSQL 起動"
exec postgres \
    -D "$PGDATA" \
    -c config_file=/etc/postgresql/postgresql.conf \
    -c hba_file=/etc/postgresql/pg_hba.conf
