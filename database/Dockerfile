FROM mysql:8.0

ENV TZ=Asia/Makassar

# Auto-run saat container pertama kali start
COPY ./database.sql /docker-entrypoint-initdb.d/01-init.sql

EXPOSE 3306
