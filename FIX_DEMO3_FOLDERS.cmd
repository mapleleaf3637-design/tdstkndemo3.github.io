@echo off
setlocal EnableExtensions
title Repair The Lost Elephant Archive - Demo 3 folders
cd /d "%~dp0"
echo.
echo Repairing Demo 3 website folders...
echo This tool only copies files; it never deletes source files.
echo.
if not exist "index.html" goto WRONG_FOLDER
if not exist "global.css" goto WRONG_FOLDER
if not exist "Epilogue.js" goto WRONG_FOLDER
if not exist "1.png" goto WRONG_FOLDER
set "ERRORS=0"
set "COPIED=0"
if not exist "css\" mkdir "css"
if not exist "js\" mkdir "js"
if not exist "js\components\" mkdir "js\components"
if not exist "js\data\" mkdir "js\data"
if not exist "js\screens\" mkdir "js\screens"
if not exist "js\stages\" mkdir "js\stages"
if not exist "assets\" mkdir "assets"
if not exist "assets\prologue\" mkdir "assets\prologue"
if not exist "assets\epilogue\" mkdir "assets\epilogue"
if not exist "assets\icons\" mkdir "assets\icons"

call :COPYFILE "global.css" "css\global.css"
call :COPYFILE "prologue.css" "css\prologue.css"
call :COPYFILE "epilogue.css" "css\epilogue.css"
call :COPYFILE "main.js" "js\main.js"
call :COPYFILE "config.js" "js\config.js"
call :COPYFILE "router.js" "js\router.js"
call :COPYFILE "gameState.js" "js\gameState.js"
call :COPYFILE "fullscreen.js" "js\fullscreen.js"
call :COPYFILE "ProloguePlayer.js" "js\components\ProloguePlayer.js"
call :COPYFILE "EpilogueNovel.js" "js\components\EpilogueNovel.js"
call :COPYFILE "EpilogueUI.js" "js\components\EpilogueUI.js"
call :COPYFILE "EvidenceComparison.js" "js\components\EvidenceComparison.js"
call :COPYFILE "FinalMessageChoice.js" "js\components\FinalMessageChoice.js"
call :COPYFILE "FinalQuestion.js" "js\components\FinalQuestion.js"
call :COPYFILE "ArchiveEntry.js" "js\screens\ArchiveEntry.js"
call :COPYFILE "Epilogue.js" "js\screens\Epilogue.js"
call :COPYFILE "stage1.js" "js\stages\stage1.js"
call :COPYFILE "stage2.js" "js\stages\stage2.js"
call :COPYFILE "prologue-scenes.js" "js\data\prologue-scenes.js"
call :COPYFILE "epilogue-scenes.js" "js\data\epilogue-scenes.js"
call :COPYFILE "1.png" "assets\prologue\1.png"
call :COPYFILE "2.png" "assets\prologue\2.png"
call :COPYFILE "3.png" "assets\prologue\3.png"
call :COPYFILE "4.png" "assets\prologue\4.png"
call :COPYFILE "5.png" "assets\prologue\5.png"
call :COPYFILE "6.png" "assets\prologue\6.png"
call :COPYFILE "7.png" "assets\prologue\7.png"
call :COPYFILE "8.png" "assets\prologue\8.png"
call :COPYFILE "9.png" "assets\prologue\9.png"
call :COPYFILE "epilogue_01.png" "assets\epilogue\epilogue_01.png"
call :COPYFILE "epilogue_02.png" "assets\epilogue\epilogue_02.png"
call :COPYFILE "epilogue_03.png" "assets\epilogue\epilogue_03.png"
call :COPYFILE "epilogue_04.png" "assets\epilogue\epilogue_04.png"
call :COPYFILE "epilogue_05.png" "assets\epilogue\epilogue_05.png"
call :COPYFILE "then_evidence.png" "assets\epilogue\then_evidence.png"
call :COPYFILE "now_evidence.png" "assets\epilogue\now_evidence.png"
call :COPYFILE "elephant-archive.svg" "assets\icons\elephant-archive.svg"
call :COPYFILE "icon-192.png" "assets\icons\icon-192.png"
call :COPYFILE "icon-512.png" "assets\icons\icon-512.png"

if not exist ".nojekyll" type nul > ".nojekyll"
echo.
if not "%ERRORS%"=="0" goto COPY_FAILURE
echo SUCCESS: %COPIED% files copied to their expected folders.
echo
echo REQUIRED FOLDERS:
echo   css\global.css  css\prologue.css  css\epilogue.css
echo   js\main.js    js\router.js     js\screens\Epilogue.js
echo   assets\prologue\1.png    assets\epilogue\epilogue_05.png
echo.
echo NEXT: Go to GitHub Desktop, Commit to main, then Push origin.
echo After GitHub Pages deployment, open:
echo https://mapleleaf3637-design.github.io/tdstkndemo3.github.io/?v=8#/epilogue-preview
echo.
pause
exit /b 0

:COPYFILE
if not exist "%~1" (
  echo MISSING source file: %~1
  set /a ERRORS+=1 >nul
  exit /b 0
)
copy /Y "%~1" "%~2" >nul
if errorlevel 1 (
  echo FAILED to copy: %~1
  set /a ERRORS+=1 >nul
) else (
  set /a COPIED+=1 >nul
)
exit /b 0

:WRONG_FOLDER
echo ERROR: This is not the repository folder with flattened website files.
echo In GitHub Desktop select tdstkndemo3.github.io and
echo choose Repository - Show in Explorer, then put this script there.
pause
exit /b 1

:COPY_FAILURE
echo ERROR: %ERRORS% source files are missing or could not be copied.
echo Do not push yet. Check that you are in the repository folder.
pause
exit /b 1
