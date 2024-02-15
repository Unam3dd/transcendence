FROM nginx:1.25.3-bookworm-perl

RUN apt-get update && apt-get install -y openssl build-essential libssl-dev && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/nginx/ssl && rm -rf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

RUN openssl req -x509 -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
        -out /etc/nginx/ssl/stales.pem \
        -keyout /etc/nginx/ssl/stales.key \
        -subj "/C=FR/ST=France/L=Angouleme/O=42/OU=stales.42.fr/CN=stales.42.fr/"

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 443

STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]