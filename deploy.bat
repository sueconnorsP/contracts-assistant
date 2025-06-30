@echo off
echo 💻 Building React frontend...
cd my-chat-ui
npm run build
cd..

echo 📁 Copying build folder to root...
xcopy /E /I /Y my-chat-ui\build build

echo 📦 Committing changes to GitHub...
git add .
git commit -m "🚀 Deploy updated build"
git push origin main

echo ✅ Deployment pushed to GitHub.
pause
