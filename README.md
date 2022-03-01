# Synclip Frontend

A simple web UI for [synclip](https://github.com/TsingJyujing/synclip).

## How to Develope

1. Install environment with `yarn`.
2. Start server with `yarn start`
    - If you'd like specify API endpoint, please set environment variable `REACT_APP_BACKEND_API_ENDPOINT`, for example: `REACT_APP_BACKEND_API_ENDPOINT=http://127.0.0.1:8080/ yarn start`.
3. Feel free to create a PR and discuss with me!

## Build Docker Image

```bash
docker build -t tsingjyujing/synclip-frontend --build-arg REACT_APP_BACKEND_API_ENDPOINT=http://127.0.0.1:8080/ .
```

Please set `REACT_APP_BACKEND_API_ENDPOINT` to your API endpoint.
