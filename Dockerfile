FROM python:3.10

ENV SSL_CERT app/cert/localhost.crt
ENV SSL_KEY app/cert/localhost.key
ENV SERVER_PSW 395

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8765

CMD python3 src/server.py