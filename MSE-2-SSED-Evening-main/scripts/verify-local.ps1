$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..'))

function Assert-DockerSuccess {
  if ($LASTEXITCODE -ne 0) { throw "Docker command failed with exit code $LASTEXITCODE" }
}

Write-Output '1. Start services and check container health'
docker compose up -d --wait
Assert-DockerSuccess
docker compose ps
Assert-DockerSuccess

Write-Output '2. Confirm frontend proxies to the healthy backend'
$homePage = Invoke-WebRequest 'http://localhost:8080/' -UseBasicParsing
$health = Invoke-RestMethod 'http://localhost:8080/health'
if ($homePage.StatusCode -ne 200 -or $health.status -ne 'ok' -or $health.postgres -ne 'ok' -or $health.redis -ne 'ok') {
  throw 'Frontend or backend health verification failed'
}
Write-Output "Frontend HTTP: $($homePage.StatusCode)"
Write-Output "Backend health via frontend: $($health | ConvertTo-Json -Compress)"

Write-Output '3. Confirm custom network and service-name DNS'
docker network inspect taskflow_net --format '{{len .Containers}} containers on taskflow_net'
Assert-DockerSuccess
docker compose exec -T backend node -e "const dns=require('dns'); Promise.all(['postgres','redis'].map(host=>dns.promises.lookup(host).then(x=>console.log(host+' -> '+x.address)))).catch(()=>process.exit(1))"
Assert-DockerSuccess

Write-Output '4. Write data, remove and recreate PostgreSQL container, then read it back'
docker compose exec -T postgres psql -U taskflow_user -d taskflow -c 'CREATE TABLE IF NOT EXISTS deployment_check (marker TEXT PRIMARY KEY);'
Assert-DockerSuccess
docker compose exec -T postgres psql -U taskflow_user -d taskflow -c "INSERT INTO deployment_check VALUES ('persisted') ON CONFLICT DO NOTHING;"
Assert-DockerSuccess
docker compose stop postgres
Assert-DockerSuccess
docker compose rm -f postgres
Assert-DockerSuccess
docker compose up -d --wait postgres
Assert-DockerSuccess
$marker = docker compose exec -T postgres psql -U taskflow_user -d taskflow -tAc "SELECT marker FROM deployment_check WHERE marker = 'persisted'"
Assert-DockerSuccess
if ($marker.Trim() -ne 'persisted') { throw 'PostgreSQL data did not persist' }
Write-Output "PostgreSQL marker after recreation: $($marker.Trim())"

Write-Output '5. Restart Redis and restore the healthy application stack'
docker compose restart redis
Assert-DockerSuccess
docker compose up -d --wait
Assert-DockerSuccess
$health = Invoke-RestMethod 'http://localhost:8080/health'
if ($health.status -ne 'ok' -or $health.postgres -ne 'ok' -or $health.redis -ne 'ok') {
  throw 'Application health failed after service restarts'
}
docker compose ps
Assert-DockerSuccess
Write-Output "Final health: $($health | ConvertTo-Json -Compress)"
Write-Output 'PASS: networking, health, persistence and Redis restart'
