FROM python:alpine3.19
WORKDIR /app
COPY requirements.txt .
RUN python -V
RUN pip install --no-cache-dir -r requirements.txt
COPY . .


# Dockerfile is mostly build/run instructions, not a full programming language.
# Application logic runs when the container starts via ENTRYPOINT or CMD.
#
# To run any language in a container:
# 1. Use a base image for that language, or install its runtime.
# 2. Copy your source code or compiled binary into the image.
# 3. Set ENTRYPOINT/CMD to start it.
#
# Example patterns:
# - Python: CMD ["python", "app.py"]
# - Node.js: CMD ["node", "server.js"]
# - Java: CMD ["java", "-jar", "app.jar"]
# - Go: CMD ["./myapp"]
CMD ["python", "/app/main.py"]