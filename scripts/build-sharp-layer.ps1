# Build Sharp Lambda Layer (PowerShell version for Windows)
# This script uses Docker to compile Sharp with Linux binaries

$ErrorActionPreference = "Stop"

$LAYER_DIR = "layers/sharp"
$NODEJS_DIR = "$LAYER_DIR/nodejs"

Write-Host "Cleaning previous layer build..." -ForegroundColor Cyan
if (Test-Path $LAYER_DIR) {
    Remove-Item -Recurse -Force $LAYER_DIR
}
New-Item -ItemType Directory -Force -Path $NODEJS_DIR | Out-Null

Write-Host "Building Sharp layer using Docker..." -ForegroundColor Cyan

$currentDir = (Get-Location).Path -replace '\\', '/'
$outputPath = "$currentDir/$NODEJS_DIR"

docker run --rm `
    -v "${outputPath}:/output" `
    --platform linux/amd64 `
    node:20-slim `
    bash -c "cd /tmp && npm cache clean --force && npm init -y && npm install sharp --save && cp -r node_modules /output/ && cp package.json /output/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Layer built successfully at $LAYER_DIR" -ForegroundColor Green
    $size = (Get-ChildItem -Recurse $LAYER_DIR | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "Layer size: $([math]::Round($size, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "Failed to build layer" -ForegroundColor Red
    exit 1
}
