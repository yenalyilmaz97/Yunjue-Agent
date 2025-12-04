server {
    server_name app.keciyibesle.com;

    # Let’s Encrypt HTTP-01 challenge
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
        allow all;
    }

    root /var/www/keciapp/frontend;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        client_max_body_size 100M;
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_request_buffering off;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff2)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
        try_files $uri =404;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/keciyibesle.com-0001/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/keciyibesle.com-0001/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


}
server {
    if ($host = app.keciyibesle.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name app.keciyibesle.com;
    return 404; # managed by Certbot


}