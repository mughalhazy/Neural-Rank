@echo off
cd /d "D:\Neural Rank\frontend"
set PUB_CACHE=D:\MobileDev\PubCache
set GRADLE_USER_HOME=D:\MobileDev\gradle-cache
D:\MobileDev\Flutter\flutter\bin\flutter.bat run -d web-server --web-hostname 0.0.0.0 --web-port 8080 --no-pub
