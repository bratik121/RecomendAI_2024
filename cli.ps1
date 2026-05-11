param (
    [string]$Command = "help",
    [switch]$SameWindow
)

$ErrorActionPreference = "Stop"

# ============================================================
# RecomendAI CLI
# ------------------------------------------------------------
# Usage:
#   .\cli.ps1 help
#   .\cli.ps1 doctor
#   .\cli.ps1 start
#   .\cli.ps1 backend
#   .\cli.ps1 frontend
#   .\cli.ps1 install
#   .\cli.ps1 migrate
#   .\cli.ps1 test
#   .\cli.ps1 build
#
# Debug mode:
#   .\cli.ps1 backend -SameWindow
#   .\cli.ps1 frontend -SameWindow
# ============================================================

$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# ------------------------------------------------------------
# Optional manual configuration
# ------------------------------------------------------------
# If auto-detection fails, set these values manually.
# Example:
#   $BackendFolderName = "recommendAIApi"
#   $FrontendFolderName = "recommendAIFront"
#
# Leave them empty to let the CLI auto-detect folders.
$BackendFolderName = ""
$FrontendFolderName = ""

# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------

function Write-Info {
    param ([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param ([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-WarningMessage {
    param ([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-ErrorMessage {
    param ([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-PathOrExit {
    param (
        [string]$Path,
        [string]$ErrorMessage
    )

    if (-not (Test-Path $Path)) {
        Write-ErrorMessage $ErrorMessage
        Write-Host ""
        Write-Info "Run diagnostics with: .\cli.ps1 doctor"
        exit 1
    }
}

function Resolve-BackendPath {
    if (-not [string]::IsNullOrWhiteSpace($BackendFolderName)) {
        return Join-Path $RootPath $BackendFolderName
    }

    $Candidates = Get-ChildItem -Path $RootPath -Directory -ErrorAction SilentlyContinue | Where-Object {
        Test-Path (Join-Path $_.FullName "manage.py")
    }

    if ($Candidates.Count -eq 1) {
        return $Candidates[0].FullName
    }

    if (Test-Path (Join-Path $RootPath "manage.py")) {
        return $RootPath
    }

    return Join-Path $RootPath "recommendAIApi"
}

function Resolve-FrontendPath {
    if (-not [string]::IsNullOrWhiteSpace($FrontendFolderName)) {
        return Join-Path $RootPath $FrontendFolderName
    }

    $Candidates = Get-ChildItem -Path $RootPath -Directory -ErrorAction SilentlyContinue | Where-Object {
        $PackageJsonPath = Join-Path $_.FullName "package.json"

        if (-not (Test-Path $PackageJsonPath)) {
            return $false
        }

        try {
            $PackageJson = Get-Content $PackageJsonPath -Raw | ConvertFrom-Json
            return ($null -ne $PackageJson.scripts.dev)
        } catch {
            return $false
        }
    }

    if ($Candidates.Count -eq 1) {
        return $Candidates[0].FullName
    }

    if (Test-Path (Join-Path $RootPath "package.json")) {
        try {
            $RootPackageJson = Get-Content (Join-Path $RootPath "package.json") -Raw | ConvertFrom-Json
            if ($null -ne $RootPackageJson.scripts.dev) {
                return $RootPath
            }
        } catch {}
    }

    return Join-Path $RootPath "recommendAIFront"
}

function Resolve-BackendPython {
    param ([string]$BackendPath)

    $PossiblePythonPaths = @(
        (Join-Path $BackendPath "venv\Scripts\python.exe"),
        (Join-Path $BackendPath ".venv\Scripts\python.exe")
    )

    foreach ($PythonPath in $PossiblePythonPaths) {
        if (Test-Path $PythonPath) {
            return $PythonPath
        }
    }

    return Join-Path $BackendPath "venv\Scripts\python.exe"
}

function Resolve-BackendActivateCommand {
    param ([string]$BackendPath)

    $VenvActivate = Join-Path $BackendPath "venv\Scripts\activate"
    $DotVenvActivate = Join-Path $BackendPath ".venv\Scripts\activate"

    if (Test-Path $VenvActivate) {
        return "venv\Scripts\activate"
    }

    if (Test-Path $DotVenvActivate) {
        return ".venv\Scripts\activate"
    }

    return "venv\Scripts\activate"
}

$BackendPath = Resolve-BackendPath
$FrontendPath = Resolve-FrontendPath
$BackendPython = Resolve-BackendPython -BackendPath $BackendPath
$BackendActivateCommand = Resolve-BackendActivateCommand -BackendPath $BackendPath

Write-Host ""
Write-Host "RecomendAI CLI running command: $Command" -ForegroundColor Cyan
Write-Host "Root path: $RootPath" -ForegroundColor DarkGray
Write-Host "Backend path: $BackendPath" -ForegroundColor DarkGray
Write-Host "Frontend path: $FrontendPath" -ForegroundColor DarkGray
Write-Host ""

# ------------------------------------------------------------
# Commands
# ------------------------------------------------------------

function Show-Help {
    Write-Host "RecomendAI CLI" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  .\cli.ps1 <command> [-SameWindow]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  start       Start frontend and backend in development mode"
    Write-Host "  backend     Start only the Django backend"
    Write-Host "  frontend    Start only the Vite frontend"
    Write-Host "  install     Install backend and frontend dependencies"
    Write-Host "  migrate     Run Django migrations"
    Write-Host "  test        Run backend and frontend tests"
    Write-Host "  build       Build frontend for production"
    Write-Host "  doctor      Show project diagnostics"
    Write-Host "  help        Show this help message"
    Write-Host ""
    Write-Host "Debug examples:"
    Write-Host "  .\cli.ps1 backend -SameWindow"
    Write-Host "  .\cli.ps1 frontend -SameWindow"
    Write-Host ""
}

function Show-Doctor {
    Write-Host "RecomendAI Project Diagnostics" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Root path:"
    Write-Host "  $RootPath"
    Write-Host ""

    Write-Host "Backend:"
    Write-Host "  Path: $BackendPath"
    Write-Host "  Python: $BackendPython"
    Write-Host "  Activate command: $BackendActivateCommand"

    if (Test-Path $BackendPath) {
        Write-Success "Backend folder found."
    } else {
        Write-ErrorMessage "Backend folder not found."
    }

    if (Test-Path (Join-Path $BackendPath "manage.py")) {
        Write-Success "manage.py found."
    } else {
        Write-ErrorMessage "manage.py not found."
    }

    if (Test-Path $BackendPython) {
        Write-Success "Backend Python found."

        try {
            Write-Host ""
            Write-Host "Python version:" -ForegroundColor Cyan
            & $BackendPython --version

            Write-Host ""
            Write-Host "pip version:" -ForegroundColor Cyan
            & $BackendPython -m pip --version

            Write-Host ""
            Write-Host "Django version:" -ForegroundColor Cyan
            & $BackendPython -m django --version
        } catch {
            Write-ErrorMessage "Could not execute backend Python, pip, or Django."
            Write-Host $_.Exception.Message
        }
    } else {
        Write-ErrorMessage "Backend Python not found."
    }

    Write-Host ""
    Write-Host "Frontend:"
    Write-Host "  Path: $FrontendPath"

    if (Test-Path $FrontendPath) {
        Write-Success "Frontend folder found."
    } else {
        Write-ErrorMessage "Frontend folder not found."
    }

    $PackageJsonPath = Join-Path $FrontendPath "package.json"

    if (Test-Path $PackageJsonPath) {
        Write-Success "package.json found."

        Write-Host ""
        Write-Host "Frontend scripts:" -ForegroundColor Cyan

        try {
            $PackageJson = Get-Content $PackageJsonPath -Raw | ConvertFrom-Json

            if ($PackageJson.scripts) {
                $PackageJson.scripts.PSObject.Properties | ForEach-Object {
                    Write-Host "  $($_.Name): $($_.Value)"
                }
            } else {
                Write-WarningMessage "No scripts object found in package.json."
            }
        } catch {
            Write-ErrorMessage "Could not read package.json scripts."
            Write-Host $_.Exception.Message
        }
    } else {
        Write-ErrorMessage "package.json not found."
    }

    Write-Host ""
    Write-Host "Node version:" -ForegroundColor Cyan
    try {
        node --version
    } catch {
        Write-ErrorMessage "Node is not available in PATH."
    }

    Write-Host ""
    Write-Host "npm version:" -ForegroundColor Cyan
    try {
        npm --version
    } catch {
        Write-ErrorMessage "npm is not available in PATH."
    }

    Write-Host ""
    Write-Info "If a path is wrong, set BackendFolderName or FrontendFolderName at the top of cli.ps1."
}

function Start-Backend {
    Test-PathOrExit $BackendPath "Backend folder not found: $BackendPath"
    Test-PathOrExit (Join-Path $BackendPath "manage.py") "manage.py not found in backend folder."
    Test-PathOrExit $BackendPython "Python interpreter not found. Expected: $BackendPython"

    Write-Info "Starting Django backend..."
    Write-Host "Backend path: $BackendPath" -ForegroundColor DarkGray

    if ($SameWindow) {
        Push-Location $BackendPath
        try {
            & $BackendPython manage.py runserver
        } finally {
            Pop-Location
        }
        return
    }

    Start-Process cmd.exe -ArgumentList @(
        "/k",
        "cd /d `"$BackendPath`" && $BackendActivateCommand && python manage.py runserver"
    )
}

function Start-Frontend {
    Test-PathOrExit $FrontendPath "Frontend folder not found: $FrontendPath"
    Test-PathOrExit (Join-Path $FrontendPath "package.json") "package.json not found in frontend folder."

    Write-Info "Starting Vite frontend..."
    Write-Host "Frontend path: $FrontendPath" -ForegroundColor DarkGray

    if ($SameWindow) {
        Push-Location $FrontendPath
        try {
            npm run dev
        } finally {
            Pop-Location
        }
        return
    }

    Start-Process cmd.exe -ArgumentList @(
        "/k",
        "cd /d `"$FrontendPath`" && npm run dev"
    )
}

function Install-Dependencies {
    Write-Info "Installing backend dependencies..."

    Test-PathOrExit $BackendPath "Backend folder not found: $BackendPath"
    Test-PathOrExit $BackendPython "Python interpreter not found. Expected: $BackendPython"

    Push-Location $BackendPath
    try {
        if (Test-Path "requirements.txt") {
            & $BackendPython -m pip install -r requirements.txt
        } else {
            Write-WarningMessage "requirements.txt not found. Skipping backend dependency installation."
        }
    } finally {
        Pop-Location
    }

    Write-Info "Installing frontend dependencies..."

    Test-PathOrExit $FrontendPath "Frontend folder not found: $FrontendPath"
    Test-PathOrExit (Join-Path $FrontendPath "package.json") "package.json not found in frontend folder."

    Push-Location $FrontendPath
    try {
        npm install
    } finally {
        Pop-Location
    }

    Write-Success "Dependencies installed."
}

function Run-Migrations {
    Test-PathOrExit $BackendPath "Backend folder not found: $BackendPath"
    Test-PathOrExit $BackendPython "Python interpreter not found. Expected: $BackendPython"

    Write-Info "Running Django migrations..."

    Push-Location $BackendPath
    try {
        & $BackendPython manage.py makemigrations
        & $BackendPython manage.py migrate
    } finally {
        Pop-Location
    }

    Write-Success "Migrations completed."
}

function Run-Tests {
    Write-Info "Running backend tests..."

    if (Test-Path $BackendPython) {
        Push-Location $BackendPath
        try {
            & $BackendPython manage.py test
        } finally {
            Pop-Location
        }
    } else {
        Write-WarningMessage "Backend Python not found. Skipping backend tests."
    }

    Write-Info "Running frontend tests..."

    $PackageJsonPath = Join-Path $FrontendPath "package.json"

    if (Test-Path $PackageJsonPath) {
        Push-Location $FrontendPath
        try {
            $PackageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

            if ($PackageJson.scripts.test) {
                npm run test
            } else {
                Write-WarningMessage "No frontend test script found in package.json. Skipping frontend tests."
            }
        } finally {
            Pop-Location
        }
    } else {
        Write-WarningMessage "Frontend package.json not found. Skipping frontend tests."
    }
}

function Build-Project {
    Write-Info "Building frontend..."

    Test-PathOrExit $FrontendPath "Frontend folder not found: $FrontendPath"
    Test-PathOrExit (Join-Path $FrontendPath "package.json") "package.json not found in frontend folder."

    Push-Location $FrontendPath
    try {
        npm run build
    } finally {
        Pop-Location
    }

    Write-Success "Frontend build completed."
}

# ------------------------------------------------------------
# Command router
# ------------------------------------------------------------

try {
    switch ($Command.ToLower()) {
        "start" {
            Write-Info "Starting full RecomendAI project..."
            Start-Backend
            Start-Frontend
        }

        "backend" {
            Start-Backend
        }

        "frontend" {
            Start-Frontend
        }

        "install" {
            Install-Dependencies
        }

        "migrate" {
            Run-Migrations
        }

        "test" {
            Run-Tests
        }

        "build" {
            Build-Project
        }

        "doctor" {
            Show-Doctor
        }

        "help" {
            Show-Help
        }

        default {
            Write-ErrorMessage "Unknown command: $Command"
            Show-Help
            exit 1
        }
    }
} catch {
    Write-Host ""
    Write-ErrorMessage $_.Exception.Message
    Write-Host ""
    Write-Info "Run diagnostics with: .\cli.ps1 doctor"
    Write-Info "Run backend in the same terminal with: .\cli.ps1 backend -SameWindow"
    Write-Info "Run frontend in the same terminal with: .\cli.ps1 frontend -SameWindow"
    exit 1
}
