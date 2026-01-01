# Move all files and directories from venue-assistant to root
$source = ".\venue-assistant"
$dest = "."

# Move all files (including hidden files)
Write-Host "Moving files..."
Get-ChildItem -Path $source -File -Force | ForEach-Object {
    $destPath = Join-Path $dest $_.Name
    if (Test-Path $destPath) {
        Write-Host "Skipping $($_.Name) - already exists at root"
    } else {
        Move-Item $_.FullName -Destination $dest
        Write-Host "Moved: $($_.Name)"
    }
}

# Move all directories except node_modules
Write-Host "`nMoving directories..."
Get-ChildItem -Path $source -Directory | Where-Object { $_.Name -ne "node_modules" } | ForEach-Object {
    $destPath = Join-Path $dest $_.Name
    if (Test-Path $destPath) {
        Write-Host "Skipping $($_.Name) - already exists at root"
    } else {
        Move-Item $_.FullName -Destination $dest
        Write-Host "Moved: $($_.Name)"
    }
}

# Keep node_modules in venue-assistant for now (we'll reinstall at root)
Write-Host "`nMoving node_modules..."
if (Test-Path ".\node_modules") {
    Write-Host "node_modules already exists at root - keeping both"
} else {
    Move-Item "$source\node_modules" -Destination $dest
    Write-Host "Moved: node_modules"
}

Write-Host "`nDone! Files moved to root level."
Write-Host "The venue-assistant directory should now be empty (or nearly empty)."
Write-Host "You can remove it with: Remove-Item .\venue-assistant -Recurse -Force"
