FROM python:3.8-slim
ENV PYTHONUNBUFFERED=1 FLASK_APP=/code/app.py PYTHONPATH=/code
WORKDIR /code
CMD ["flask", "run", "--host=0.0.0.0"]

#RUN apk update && \
##    # Needed to compile a poetry dependecy(cryptography)
##    apk add --no-cache \
##        gcc \
##        musl-dev \
##        python3-dev \
##        libffi-dev \
##        openssl-dev \
##        nodejs && \
#    pip install --upgrade pip && \
RUN pip install poetry
COPY pyproject.toml poetry.lock ./

#FROM base as development
# poetry install is not cachable. So we install with pip
RUN poetry export -f requirements.txt --dev | pip install -r /dev/stdin
COPY . .

#FROM base as prod
#RUN poetry export -f requirements.txt | pip install -r /dev/stdin
#ENTRYPOINT ["./init.sh"]
#CMD ["api"]
#COPY . .
