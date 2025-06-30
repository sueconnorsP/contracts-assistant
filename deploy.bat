@echo off
SETLOCAL

echo 💻 Starting deploy script...

echo.
echo 📦 Step 1: Building React frontend...
cd my-chat-ui || exit /b
call npm run build || (
  echo ❌ Build failed. Check your code and try again.
  pause
  exit /b
)
cd..

echo.
echo 📁 Step 2: Copying build folder to server root...
xcopy /E /I /Y my-chat-ui\build build

echo.
echo 🗃️ Step 3: Committing changes to GitHub...
git add .
git commit -m "🚀 Deploy updated build"
git push origin main

echo.
echo ✅ All done! Changes pushed to GitHub.
pause
