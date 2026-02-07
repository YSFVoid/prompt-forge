FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Create artifacts directory
RUN mkdir -p ./artifacts

EXPOSE 8000

ENV PORT=8000
ENV ARTIFACTS_PATH=./artifacts

CMD ["python", "main.py"]
