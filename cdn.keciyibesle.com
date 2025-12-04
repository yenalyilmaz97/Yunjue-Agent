server {
	listen 80;
	server_name cdn.keciyibesle.com;

	location ^~ /.well-known/acme-challenge/ {
		root /var/www/letsencrypt;
		allow all;
	}

	location / {
		return 301 https://$host$request_uri;
	}
}

server { 
	listen 443 ssl;
	server_name cdn.keciyibesle.com;

	ssl_certificate /etc/letsencrypt/live/cdn.keciyibesle.com/fullchain.pem;
	ssl_certificate_key /etc/letsencrypt/live/cdn.keciyibesle.com/privkey.pem;

	root /var/media/keciapp;
	index index.html;

	location ~* \.(css|js|mjs|png|jpg|jpeg|gif|webp|svg|ico|ttf|otf|woff|woff2|mp3|mp4|ogg|wav)$ {
		add_header Cache-Control "public, max-age=31536000, immutable";
		add_header Access-Control-Allow-Origin "*" always;
		try_files $uri =404;
	}

	location ~* \.(html)$ {
		add_header Cache-Control "public, max-age=60";
		try_files $uri =404;
	}

	location / {
		autoindex on;
		try_files $uri $uri $uri/ /index.html;
	}

	gzip on;
	gzip_types text/plain text/css application/javascript application/json image/svg+xml;
	gzip_min_length 250;

	access_log /var/log/nginx/cdn_access.log;
	error_log /var/log/nginx/cdn_error.log;
}
