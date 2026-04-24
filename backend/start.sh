#!/bin/bash
# 切换到 backend 目录再启动，确保 tsx 模块解析正确
cd "$(dirname "$0")"
node --env-file=.env --import tsx/esm src/app.ts
