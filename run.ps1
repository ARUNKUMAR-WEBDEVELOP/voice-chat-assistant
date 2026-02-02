# Tamil → English Chat – Run both frontend and backend
# Opens 2 terminals

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\live-transcribe-backend'; .\venv\Scripts\Activate.ps1; python manage.py runserver"

Start-Sleep -Seconds 2

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\live-transcribe-frontend'; npm run dev"
