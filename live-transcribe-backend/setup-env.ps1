# Create .env with your OpenAI API key
# Run: .\setup-env.ps1
# Or: .\setup-env.ps1 -ApiKey "sk-your-key"

param([string]$ApiKey = "")

$envFile = Join-Path $PSScriptRoot ".env"
$exampleFile = Join-Path $PSScriptRoot ".env.example"

if (!(Test-Path $exampleFile)) {
    Write-Host "Error: .env.example not found" -ForegroundColor Red
    exit 1
}

if (!(Test-Path $envFile)) {
    Copy-Item $exampleFile $envFile
    Write-Host "Created .env from .env.example" -ForegroundColor Green
}

if ($ApiKey) {
    $content = Get-Content $envFile -Raw
    $content = $content -replace 'OPENAI_API_KEY=.*', "OPENAI_API_KEY=$ApiKey"
    Set-Content $envFile $content -NoNewline
    Write-Host "API key saved. Restart the backend: python manage.py runserver" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Add your OpenAI API key to .env:" -ForegroundColor Yellow
    Write-Host "1. Open: $envFile"
    Write-Host "2. Set: OPENAI_API_KEY=sk-proj-your-key"
    Write-Host "3. Restart backend: python manage.py runserver"
    Write-Host ""
}
