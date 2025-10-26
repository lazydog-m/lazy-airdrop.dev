@echo off
:: --- Configuration ---
set "ROOT=%~dp0"
set "CMD_PATH=%ProgramFiles%\nodejs\npm.cmd"
set "CHROME_PATH=C:\GoogleChromePortable64\App\Chrome-bin\chrome.exe"
set "TEMP_PROFILE_DIR=C:\GoogleChromePortable64\LazyAirdrop_Chrome"
set "CLIENT_PORT=5173"
set "SERVER_PORT=3000"
set "PROJECT_URL=http://localhost:%CLIENT_PORT%/dashboard/project/list"
set "NIRCMD_PATH=%ROOT%\server\tools\nircmd-x64\nircmd.exe"
chcp 65001 >nul

@echo off
echo =========================================
echo 🚀 Starting LazyAirdrop ...
echo =========================================

:: --- Check Chrome process with correct profile path ---
for /f "usebackq delims=" %%a in (`powershell -NoProfile -Command "$dir=$env:TEMP_PROFILE_DIR; $chrome=Get-CimInstance Win32_Process -Filter 'Name=''chrome.exe''' | Where-Object { $_.CommandLine -like ('*' + $dir + '*') }; if ($chrome){$chrome[0].ProcessId}"`) do set CHROME_PID=%%a

if defined CHROME_PID (
    set CHROME_RUNNING=0
) else (
    set CHROME_RUNNING=1
)


if %CHROME_RUNNING%==0 (
echo.
echo ✅ Application already started ...
    
%NIRCMD_PATH% win activate process /%CHROME_PID%
%NIRCMD_PATH% win max process /%CHROME_PID%

exit
) 



powershell -Command "Start-Process '%CMD_PATH%' -ArgumentList 'run','dev' -WorkingDirectory '%ROOT%' -WindowStyle Hidden"

echo.
echo 🔄 Loading application ...

:wait_ports
timeout /t 1 >nul

netstat -ano | find "LISTENING" | find ":%SERVER_PORT%" >nul
if errorlevel 1 goto wait_ports

netstat -ano | find "LISTENING" | find ":%CLIENT_PORT%" >nul
if errorlevel 1 goto wait_ports

echo.
echo ✅ Application started ...

powershell -Command "Start-Process 'cmd.exe' -ArgumentList '/c start /wait "%CHROME_PATH%" --user-data-dir="%TEMP_PROFILE_DIR%" --no-default-browser-check --hide-crash-restore-bubble --no-first-run --start-maximized --app="%PROJECT_URL%" & taskkill /IM node.exe /F >nul 2>&1' -WindowStyle Hidden"

exit





