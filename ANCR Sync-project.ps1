#Requires -Version 5.1
# Project Sync - GitHub push/pull, machine handoff, file copy (network/share/USB)
#
# Modes:
#   [G] GitHub  - branch switch, push, pull
#   [H] Handoff - commit + push + start a Claude cloud session, for when you are
#                 leaving this machine
#   [T] Pull-In - the other end of [H]: pre-flight, then claude --teleport to pull
#                 a cloud session (branch + full conversation) onto this machine
#   [F] File    - robocopy to a network drive, machine share, or USB
#
# Every menu has a [X] Back option that returns one page up; [Q] Quit exits.
# Only genuinely fatal conditions (missing tools, robocopy/claude hard failures)
# terminate the script - everything else loops back to the main menu.
#
# Tuned for this repo: a pnpm + turbo workspace (packages/api, packages/web).
#   - node_modules is never synced; use the pnpm install prompt after a pull.
#   - .env is EXCLUDED by default (it is gitignored, and holds JWT_SECRET and
#     local DB credentials). Pass -IncludeEnv to carry it to a trusted machine.
[CmdletBinding()]
param(
	[string]$ProjectRoot,
	# Directory names skipped anywhere in the tree (build output + machine-local state).
	[string[]]$ExcludeDirs = @(
		'.git', '.turbo', 'node_modules', 'dist', 'build', 'coverage', '.vscode', '.idea'
	),
	# File name patterns skipped anywhere in the tree.
	[string[]]$ExcludeFiles = @('*.log', '.DS_Store', '*.suo'),
	# Opt in to copying .env files (secrets) to the destination.
	[switch]$IncludeEnv
)

# ============================================================================
# RESOLVE PROJECT ROOT
# ============================================================================

if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
	$ProjectRoot = (Resolve-Path $PSScriptRoot).Path
} else {
	$ProjectRoot = (Resolve-Path $ProjectRoot).Path
}
$ProjectName = Split-Path $ProjectRoot -Leaf

# Secrets stay out of removable media / shares unless explicitly opted in.
if (-not $IncludeEnv) {
	$ExcludeFiles = @($ExcludeFiles) + '.env'
}

# ============================================================================
# HELPER FUNCTIONS - GIT
# ============================================================================

function Invoke-Git {
	param([string[]]$Arguments)
	$result = & git -C $ProjectRoot @Arguments 2>&1
	# Cast every item to string so stderr lines are never NativeCommandError objects
	return @($result | ForEach-Object { "$_" })
}

function Get-GitBranch {
	$b = Invoke-Git @('rev-parse', '--abbrev-ref', 'HEAD')
	return ($b | Out-String).Trim()
}

function Get-GitRemoteUrl {
	$url = Invoke-Git @('remote', 'get-url', 'origin') 2>$null
	if ($LASTEXITCODE -ne 0) { return $null }
	return ($url | Out-String).Trim()
}

function Get-GitStatus {
	# Returns array of status lines, empty if clean
	$lines = Invoke-Git @('status', '--short')
	return @($lines | Where-Object { $_ -match '\S' })
}

function Get-LastChangedFile {
	# Most recently modified tracked file from git status
	$lines = Get-GitStatus
	if ($lines.Count -eq 0) { return 'no changes' }
	$first = $lines[0] -replace '^\s*\S+\s+', ''
	return $first.Trim()
}

function Get-RemoteCommits {
	param([int]$Count = 5)
	# Format: hash|date(YYYY-MM-DD)|refs|subject
	# --remotes enumerates all remote-tracking refs (works even when 'origin' is ambiguous as a revision)
	$raw = Invoke-Git @('log', '--remotes', "--format=%h|%as|%D|%s", "-$Count")
	$commits = @()
	foreach ($line in $raw) {
		if ([string]::IsNullOrWhiteSpace($line)) { continue }
		$parts  = $line -split '\|', 4
		$hash   = $parts[0].Trim()
		$date   = $parts[1].Trim()
		$refs   = $parts[2].Trim()
		$subj   = if ($parts.Count -ge 4) { $parts[3].Trim() } else { '(no message)' }

		# Extract branch name from refs (prefer remote branch names)
		$branch = ''
		if ($refs -match 'origin/([^,\s]+)') { $branch = $Matches[1] }
		elseif ($refs -match '([^,\s]+)')     { $branch = $Matches[1] }

		$commits += [pscustomobject]@{
			Hash    = $hash
			Date    = $date
			Branch  = $branch
			Subject = $subj
		}
	}
	return $commits
}

function Test-GitAvailable {
	$null = & git --version 2>$null
	return $LASTEXITCODE -eq 0
}

function Test-GitRepo {
	$null = Invoke-Git @('rev-parse', '--git-dir') 2>$null
	return $LASTEXITCODE -eq 0
}

function New-AutoCommitMessage {
	# The message shape this script has always used: [timestamp] - branch - (last change: file)
	param([string]$Branch)
	$ts       = Get-Date -Format 'yyyy-MM-dd HH:mm'
	$lastFile = Get-LastChangedFile
	return "[$ts] - $Branch - (last change: $lastFile)"
}

function Read-CommitMessage {
	# Offers the auto message, lets the user type their own instead.
	# Returns $null when the user supplies an empty custom message (caller aborts).
	param([string]$AutoMessage)
	Write-Host ''
	Write-Host '  Proposed commit message:'
	Write-Host "    `"$AutoMessage`""
	Write-Host ''
	Write-Host '  [Enter] Accept   [R] Rename'
	$choice = Read-Host '  Choose'
	if ($choice -notmatch '^[Rr]') { return $AutoMessage }
	$custom = Read-Host '  Commit message'
	if ([string]::IsNullOrWhiteSpace($custom)) { return $null }
	return $custom
}

function Invoke-CommitAll {
	# Stages tracked + untracked changes and commits. Returns $true on success.
	param([string]$Message)
	Write-Host ''
	Write-Host '  Staging all changes...'
	$addOut = Invoke-Git @('add', '-A')
	if ($LASTEXITCODE -ne 0) {
		Write-Host "ERROR: git add failed:`n$addOut"
		return $false
	}
	Write-Host "  Committing: `"$Message`""
	$commitOut = Invoke-Git @('commit', '-m', $Message)
	if ($LASTEXITCODE -ne 0) {
		Write-Host "ERROR: git commit failed:`n$commitOut"
		return $false
	}
	$commitOut | Out-Host
	return $true
}

function Invoke-PushBranch {
	# Pushes the named branch to origin, establishes upstream tracking, and
	# verifies that GitHub received the exact local commit. Returns $true on
	# success. A successful local commit is not enough: the remote verification
	# is what makes this flow safe for handoff/cloud work.
	param([string]$Branch)
	Write-Host ''
	$remoteUrl = Get-GitRemoteUrl
	if ([string]::IsNullOrWhiteSpace($remoteUrl)) {
		Write-Host 'ERROR: No origin remote is configured. Use GitHub mode to add one first.'
		return $false
	}

	Write-Host "  Checking GitHub connectivity ($remoteUrl)..."
	$probeOut = Invoke-Git @('ls-remote', 'origin')
	if ($LASTEXITCODE -ne 0) {
		Write-Host ''
		Write-Host 'ERROR: GitHub could not be reached or authentication failed.'
		$probeOut | Out-Host
		Write-Host '  Check your network connection, GitHub login/token, and repository permission.'
		Write-Host "  Remote: $remoteUrl"
		return $false
	}

	$localCommit = ((Invoke-Git @('rev-parse', 'HEAD')) | Out-String).Trim()
	if ([string]::IsNullOrWhiteSpace($localCommit) -or $LASTEXITCODE -ne 0) {
		Write-Host 'ERROR: Could not determine the local commit to push.'
		return $false
	}

	Write-Host "  Pushing origin/$Branch and setting upstream tracking ..."
	$pushOut = Invoke-Git @('push', '--set-upstream', 'origin', $Branch)
	$pushOut | Out-Host
	if ($LASTEXITCODE -ne 0) {
		Write-Host ''
		Write-Host 'ERROR: Push failed. If the remote has newer commits, pull first then retry.'
		Write-Host "  Remote: $remoteUrl"
		return $false
	}

	Write-Host "  Verifying origin/$Branch contains $($localCommit.Substring(0, 12)) ..."
	$remoteRef = Invoke-Git @('ls-remote', '--heads', 'origin', $Branch)
	if ($LASTEXITCODE -ne 0 -or $remoteRef.Count -eq 0) {
		Write-Host ''
		Write-Host 'ERROR: git push reported success, but the branch was not found on origin.'
		Write-Host '  Refresh GitHub and check that you are viewing the correct repository.'
		return $false
	}

	$remoteCommit = (($remoteRef | Select-Object -First 1) -split '\s+')[0].Trim()
	if ($remoteCommit -ne $localCommit) {
		Write-Host ''
		Write-Host 'ERROR: origin has the branch, but it points to a different commit.'
		Write-Host "  Local : $localCommit"
		Write-Host "  Remote: $remoteCommit"
		return $false
	}

	Write-Host "  Verified: origin/$Branch -> $($remoteCommit.Substring(0, 12))"
	return $true
}

function Test-ClaudeAvailable {
	return $null -ne (Get-Command claude -ErrorAction SilentlyContinue)
}

function ConvertTo-GitHubRemoteUrl {
	param([string]$RemoteUrl)

	if ([string]::IsNullOrWhiteSpace($RemoteUrl)) { return $RemoteUrl }

	$normalUrl = $RemoteUrl.Trim().TrimEnd('/')

	if ($normalUrl -match '^git@') {
		return $normalUrl
	}

	if ($normalUrl -match '^(?:https?://)?(?:www\.)?github\.com/(.+)$') {
		$normalUrl = "https://github.com/$($Matches[1].TrimStart('/'))"
	} elseif ($normalUrl -notmatch '^https?://') {
		$normalUrl = "https://github.com/$normalUrl"
	}

	if ($normalUrl -notmatch '\.git$') { $normalUrl = "$normalUrl.git" }

	return $normalUrl
}

# ============================================================================
# HELPER FUNCTIONS - WORKSPACE
# ============================================================================

function Invoke-WorkspaceInstall {
	# node_modules is never synced, so a freshly pulled/received tree has no
	# dependencies. This repo pins pnpm via the root "only-allow pnpm" preinstall.
	param([string]$Root)

	Write-Host ''
	Write-Host '  This is a pnpm workspace and node_modules is not synced.'
	$doInstall = Read-Host '  Run "pnpm install" now to restore dependencies? [Y/N]'
	if ($doInstall -notmatch '^[Yy]') {
		Write-Host '  Skipped. Run "pnpm install" manually before starting the app.'
		return
	}

	$pnpmCmd = Get-Command pnpm -ErrorAction SilentlyContinue
	if ($null -eq $pnpmCmd) {
		Write-Host '  pnpm was not found in PATH. Install it with:  npm install -g pnpm'
		return
	}

	Push-Location $Root
	try {
		& pnpm install
		if ($LASTEXITCODE -ne 0) {
			Write-Host '  pnpm install reported errors - review the output above.'
		} else {
			Write-Host '  Dependencies installed.'
		}
	} finally {
		Pop-Location
	}
}

# ============================================================================
# HELPER FUNCTIONS - FILE COPY (ROBOCOPY)
# ============================================================================

function Test-ExcludedPath {
	param(
		[string]$RelativePath,
		[string[]]$DirList,
		[string[]]$FileList
	)
	$segments = $RelativePath.Split('\')
	# Every segment except the leaf is a directory
	for ($i = 0; $i -lt $segments.Count - 1; $i++) {
		if ($DirList -contains $segments[$i]) { return $true }
	}
	$leaf = $segments[$segments.Count - 1]
	foreach ($pattern in $FileList) {
		if ($leaf -like $pattern) { return $true }
	}
	return $false
}

function Get-FileIndex {
	param([string]$Root, [string[]]$DirList, [string[]]$FileList)
	$index = @{}
	if (!(Test-Path $Root)) { return $index }
	Get-ChildItem -LiteralPath $Root -File -Recurse -Force | ForEach-Object {
		$rel = $_.FullName.Substring($Root.Length).TrimStart('\')
		if (Test-ExcludedPath -RelativePath $rel -DirList $DirList -FileList $FileList) { return }
		$index[$rel] = [pscustomobject]@{
			Length           = $_.Length
			LastWriteTimeUtc = $_.LastWriteTimeUtc
		}
	}
	return $index
}

function Show-DiffSummary {
	param([hashtable]$LocalIndex, [hashtable]$RemoteIndex)
	$localNewer = 0; $remoteNewer = 0
	$allPaths = @($LocalIndex.Keys + $RemoteIndex.Keys | Sort-Object -Unique)
	foreach ($path in $allPaths) {
		$lf = $LocalIndex[$path]; $rf = $RemoteIndex[$path]
		if ($null -eq $lf)  { $remoteNewer++; continue }
		if ($null -eq $rf)  { $localNewer++;  continue }
		$same = ($lf.Length -eq $rf.Length) -and ([math]::Abs(($lf.LastWriteTimeUtc - $rf.LastWriteTimeUtc).TotalSeconds) -le 2)
		if ($same) { continue }
		if ($lf.LastWriteTimeUtc -gt $rf.LastWriteTimeUtc) { $localNewer++ } else { $remoteNewer++ }
	}
	Write-Host "  Files newer locally : $localNewer"
	Write-Host "  Files newer remotely: $remoteNewer"
	if ($localNewer -eq 0 -and $remoteNewer -eq 0) { Write-Host '  Both sides are already in sync.' }
}

function Invoke-RoboSync {
	param(
		[string]$Source,
		[string]$Destination,
		[string[]]$DirList,
		[string[]]$FileList
	)
	if (!(Test-Path $Destination)) {
		New-Item -ItemType Directory -Path $Destination -Force | Out-Null
	}
	$roboArgs = @($Source, $Destination, '/MIR', '/FFT', '/Z', '/R:2', '/W:1', '/XJ', '/NP', '/NFL', '/NDL')
	foreach ($item in $DirList)  { $roboArgs += '/XD'; $roboArgs += $item }
	foreach ($item in $FileList) { $roboArgs += '/XF'; $roboArgs += $item }
	& robocopy @roboArgs | Out-Host
	if ($LASTEXITCODE -ge 8) { throw "Robocopy failed with exit code $LASTEXITCODE." }
	$global:LASTEXITCODE = 0
}

# ============================================================================
# HELPER FUNCTIONS - UI
# ============================================================================

function Invoke-Menu {
	param(
		[string]$Prompt,
		[string[]]$Options
	)

	# Check if RawUI and console cursor positioning are supported
	$rawUiSupported = $false
	try {
		if ($null -ne $Host -and $null -ne $Host.UI -and $null -ne $Host.UI.RawUI) {
			# Raw UI check & cursor top test to verify capability
			$null = $Host.UI.RawUI.KeyAvailable
			$null = [Console]::CursorTop
			$rawUiSupported = $true
		}
	} catch {
		$rawUiSupported = $false
	}

	if (-not $rawUiSupported) {
		# Fallback to standard numbered list
		Write-Host ''
		Write-Host $Prompt
		for ($i = 0; $i -lt $Options.Count; $i++) {
			Write-Host "  [$($i + 1)] $($Options[$i])"
		}
		Write-Host ''
		while ($true) {
			$selection = Read-Host "  Select option [1-$($Options.Count)]"
			$val = 0
			if ([int]::TryParse($selection, [ref]$val) -and $val -ge 1 -and $val -le $Options.Count) {
				return $Options[$val - 1]
			}
			Write-Host "  Invalid selection."
		}
	}

	try { $Host.UI.RawUI.CursorVisible = $false } catch {}
	$startTop = [Console]::CursorTop
	$startLeft = [Console]::CursorLeft
	$selected = 0

	try {
		while ($true) {
			[Console]::SetCursorPosition($startLeft, $startTop)
			Write-Host $Prompt
			for ($i = 0; $i -lt $Options.Count; $i++) {
				if ($i -eq $selected) {
					Write-Host "  > $($Options[$i])".PadRight(60) -ForegroundColor Cyan
				} else {
					Write-Host "    $($Options[$i])".PadRight(60)
				}
			}
			$key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
			if ($key.VirtualKeyCode -eq 38) { # Up
				if ($selected -gt 0) { $selected-- }
			} elseif ($key.VirtualKeyCode -eq 40) { # Down
				if ($selected -lt ($Options.Count - 1)) { $selected++ }
			} elseif ($key.VirtualKeyCode -eq 13) { # Enter
				Write-Host ""
				return $Options[$selected]
			}
		}
	} catch {
		# Fallback if Console positioning fails at runtime
		Write-Host ''
		Write-Host $Prompt
		for ($i = 0; $i -lt $Options.Count; $i++) {
			Write-Host "  [$($i + 1)] $($Options[$i])"
		}
		Write-Host ''
		while ($true) {
			$selection = Read-Host "  Select option [1-$($Options.Count)]"
			$val = 0
			if ([int]::TryParse($selection, [ref]$val) -and $val -ge 1 -and $val -le $Options.Count) {
				return $Options[$val - 1]
			}
			Write-Host "  Invalid selection."
		}
	} finally {
		try { $Host.UI.RawUI.CursorVisible = $true } catch {}
	}
}

# ============================================================================
# VALIDATE
# ============================================================================

if (!(Test-Path $ProjectRoot)) { throw "Project root not found: $ProjectRoot" }

# ============================================================================
# DISPLAY HEADER
# ============================================================================

$gitReady  = (Test-GitAvailable) -and (Test-GitRepo)
$branch    = if ($gitReady) { Get-GitBranch } else { 'N/A' }
$remoteUrl = if ($gitReady) { Get-GitRemoteUrl } else { $null }

Write-Host ''
Write-Host '============================================'
Write-Host "         Project Sync - $ProjectName"
Write-Host '============================================'
Write-Host "  Project : $ProjectRoot"
Write-Host "  Branch  : $branch"
if ($remoteUrl) { Write-Host "  Remote  : $remoteUrl" }
if ($IncludeEnv) {
	Write-Host '  .env    : INCLUDED (-IncludeEnv) - secrets will be copied'
} else {
	Write-Host '  .env    : excluded (pass -IncludeEnv to copy it)'
}
Write-Host ''

# ============================================================================
# TOP-LEVEL MENU - loop until [Q] Quit. Every flow can [X] Back to here.
# ============================================================================

:top while ($true) {

	Write-Host '[G] GitHub  - push / pull with remote repo'
	Write-Host '[H] Handoff - commit + push, then hand the task to a Claude cloud session'
	Write-Host '[T] Pull-In - pull a cloud session into this machine (claude --teleport)'
	Write-Host '[F] File    - copy to network drive, machine share, or USB'
	Write-Host '[Q] Quit'
	Write-Host ''
	$mode = Read-Host 'Choose mode [G/H/T/F/Q]'

	switch -Regex ($mode) {

	# ============================================================================
	# G - GITHUB FLOW
	# ============================================================================
	'^[Gg]' {

		if (!(Test-GitAvailable)) {
			Write-Host 'ERROR: git is not available in PATH. Install Git for Windows and retry.'
			exit 1
		}
		$isNewSetup = $false
		if (!(Test-GitRepo)) {
			Write-Host ''
			Write-Host "  $ProjectRoot is not a git repository."
			$setup = Read-Host '  Would you like to initialize it and download a branch? [Y/N]'
			if ($setup -notmatch '^[Yy]') { continue top }
			Invoke-Git @('init') | Out-Host
			$isNewSetup = $true
		}

		$remoteUrl = Get-GitRemoteUrl
		if (-not $remoteUrl) {
			Write-Host ''
			$setupRemote = Read-Host '  No "origin" remote found. Enter GitHub URL to add (or press Enter to go back)'
			if ([string]::IsNullOrWhiteSpace($setupRemote)) { continue top }
			Invoke-Git @('remote', 'add', 'origin', $setupRemote.Trim()) | Out-Host
			$remoteUrl = Get-GitRemoteUrl
			$isNewSetup = $true
		}

		if ($remoteUrl) {
			$normalUrl = ConvertTo-GitHubRemoteUrl -RemoteUrl $remoteUrl
			if ($normalUrl -ne $remoteUrl) {
				Write-Host "  Using URL: $normalUrl"
				Invoke-Git @('remote', 'set-url', 'origin', $normalUrl) | Out-Null
			}
			$remoteUrl = $normalUrl
		}

		if ($isNewSetup) {

			# ---- Fetch all remote branches ----
			Write-Host ''
			Write-Host '  Connecting to GitHub and fetching branch list...'
			Invoke-Git @('config', 'remote.origin.fetch', '+refs/heads/*:refs/remotes/origin/*') | Out-Null
			$fetchOut = Invoke-Git @('fetch', 'origin', '--prune')
			if ($LASTEXITCODE -ne 0) {
				Write-Host ''
				Write-Host '  ERROR: Could not connect to the remote repository.'
				Write-Host "  $fetchOut"
				Write-Host '  Please check the URL and your network/credentials, then run the script again.'
				exit 1
			}

			# ---- Build branch list and show picker ----
			$remoteBranches = Invoke-Git @('branch', '-r')
			$cleanBranches = @()
			foreach ($b in $remoteBranches) {
				if ([string]::IsNullOrWhiteSpace($b) -or $b -match 'HEAD ->') { continue }
				$b = $b.Trim() -replace '^remotes/origin/', '' -replace '^origin/', ''
				if ($cleanBranches -notcontains $b) { $cleanBranches += $b }
			}
			$cleanBranches = $cleanBranches | Sort-Object

			if ($cleanBranches.Count -eq 0) {
				Write-Host '  No remote branches found. The repository may be empty.'
				exit 1
			}

			Write-Host ''
			$branchToPull = Invoke-Menu -Prompt '  Select a branch to download (Up/Down arrows, Enter to confirm):' -Options @($cleanBranches + '[Back]')
			if ($branchToPull -eq '[Back]') { continue top }

			# ---- Checkout selected branch ----
			Write-Host ''
			Write-Host "  Downloading branch '$branchToPull' into current folder..."
			$coOut = Invoke-Git @('checkout', '-B', $branchToPull, "origin/$branchToPull")
			if ($LASTEXITCODE -ne 0) {
				Write-Host "  Checkout failed - forcing overwrite of local files..."
				Invoke-Git @('checkout', '-f', '-B', $branchToPull, "origin/$branchToPull") | Out-Host
				if ($LASTEXITCODE -ne 0) {
					Write-Host "  ERROR: Could not download branch. Check permissions and try again."
					exit 1
				}
			} else {
				$coOut | Out-Host
			}
			Write-Host ''
			Write-Host "  Done! Branch '$branchToPull' is now checked out in $ProjectRoot"
			Write-Host ''
			Write-Host '  NOTE: .env is not tracked by git. Copy packages/api/.env.example'
			Write-Host '        to packages/api/.env and fill in your local values.'
			Invoke-WorkspaceInstall -Root $ProjectRoot
			continue top
		}

		# ---- GitHub submenu: Branch / Push / Pull / Back ----
		:github while ($true) {
			$branch = Get-GitBranch
			Write-Host ''
			Write-Host "  Current Branch: $branch"
			Write-Host ''
			Write-Host '  [B] Branch - switch or create a branch'
			Write-Host '  [P] Push   - send local commits to GitHub'
			Write-Host '  [L] Pull   - fetch commits from GitHub'
			Write-Host '  [X] Back   - return to the main menu'
			Write-Host ''
			$githubDir = Read-Host '  Choose [B/P/L/X]'

			if ($githubDir -match '^[Xx]') { continue top }

			if ($githubDir -match '^[Bb]') {
				Write-Host ''
				Write-Host '  Fetching remote branches from GitHub...'
				# Fix single-branch clone refspec so all remote branches are fetched
				$currentRefspec = Invoke-Git @('config', '--get', 'remote.origin.fetch')
				$currentRefspec = ($currentRefspec | Out-String).Trim()
				if ($currentRefspec -and $currentRefspec -ne '+refs/heads/*:refs/remotes/origin/*') {
					Write-Host '  (Widening fetch refspec to include all branches...)'
					Invoke-Git @('config', 'remote.origin.fetch', '+refs/heads/*:refs/remotes/origin/*') | Out-Null
				}
				$fetchOut = Invoke-Git @('fetch', 'origin', '--prune')
				if ($LASTEXITCODE -ne 0) {
					Write-Host "  WARNING: Fetch failed, listing cached branches only.`n$fetchOut"
				}
				Write-Host ''
				$branches = Invoke-Git @('branch', '-a')
				$cleanBranches = @()
				foreach ($b in $branches) {
					if ([string]::IsNullOrWhiteSpace($b) -or $b -match 'HEAD ->') { continue }
					$b = $b.Trim()
					$b = $b -replace '^\*\s+', ''
					$b = $b -replace '^remotes/origin/', ''
					$b = $b -replace '^origin/', ''
					if ($cleanBranches -notcontains $b) { $cleanBranches += $b }
				}
				$cleanBranches = $cleanBranches | Sort-Object

				$opts = @($cleanBranches) + "[Create NEW branch...]" + "[Back]"
				Write-Host ''
				$newBranch = Invoke-Menu -Prompt '  Available branches (Use Up/Down arrows, then Enter):' -Options $opts

				if ($newBranch -eq '[Back]') { continue github }
				if ($newBranch -eq '[Create NEW branch...]') {
					Write-Host ''
					$newBranch = Read-Host '  Enter NEW branch name'
					if ([string]::IsNullOrWhiteSpace($newBranch)) { continue github }
					$newBranch = $newBranch.Trim()
				}

				$coOut = Invoke-Git @('checkout', $newBranch)
				if ($LASTEXITCODE -eq 0) {
					$coOut | Out-Host
				} else {
					Write-Host ''
					Write-Host "  Branch '$newBranch' not found locally or remotely."
					$create = Read-Host "  Create it as a NEW branch from your current state? [Y/N]"
					if ($create -match '^[Yy]') {
						Invoke-Git @('checkout', '-b', $newBranch) | Out-Host
					}
				}
				continue github
			}

			# -------------------------------------------------------------------
			# GITHUB PUSH
			# -------------------------------------------------------------------
			if ($githubDir -match '^[Pp]') {

				$statusLines = Get-GitStatus
				$isDirty     = $statusLines.Count -gt 0

				if ($isDirty) {
					:pushMenu while ($true) {
						Write-Host ''
						Write-Host "  You have $($statusLines.Count) uncommitted file(s):"
						$statusLines | Select-Object -First 10 | ForEach-Object { Write-Host "    $_" }
						if ($statusLines.Count -gt 10) { Write-Host "    ... and $($statusLines.Count - 10) more" }
						Write-Host ''
						Write-Host '  [C] Commit current state, then push'
						Write-Host '  [S] Skip commit - push existing HEAD as-is'
						Write-Host '  [X] Back   - return to the GitHub menu'
						Write-Host ''
						$commitChoice = Read-Host '  Choose [C/S/X]'

						if ($commitChoice -match '^[Xx]') { continue github }

						if ($commitChoice -match '^[Cc]') {
							$commitMessage = Read-CommitMessage -AutoMessage (New-AutoCommitMessage -Branch $branch)
							if ($null -eq $commitMessage) {
								Write-Host '  Commit message cannot be empty. Choose again or pick [X] Back.'
								continue pushMenu
							}
							if (-not (Invoke-CommitAll -Message $commitMessage)) { continue pushMenu }
							break
						}

						if ($commitChoice -match '^[Ss]') { break }

						Write-Host '  Invalid selection. Please choose again.'
					}
				} else {
					Write-Host ''
					Write-Host '  Working tree is clean - nothing to commit.'
				}

				# Push
				if (-not (Invoke-PushBranch -Branch $branch)) { continue github }
				Write-Host ''
				Write-Host "Done. HEAD pushed to origin/$branch."
				continue top
			}

			# -------------------------------------------------------------------
			# GITHUB PULL
			# -------------------------------------------------------------------
			if ($githubDir -match '^[Ll]') {

				Write-Host ''
				Write-Host '  Fetching from origin...'
				$fetchOut = Invoke-Git @('fetch', 'origin', '--prune')
				if ($LASTEXITCODE -ne 0) {
					Write-Host "ERROR: git fetch failed:`n$fetchOut"
					continue github
				}
				Write-Host '  Fetch complete.'
				Write-Host ''

				$commits = Get-RemoteCommits -Count 5

				if ($commits.Count -eq 0) {
					Write-Host 'No commits found on origin. Is the remote repo empty?'
					continue github
				}

				Write-Host '  Last 5 commits on origin:'
				Write-Host ''
				for ($i = 0; $i -lt $commits.Count; $i++) {
					$c       = $commits[$i]
					$num     = $i + 1
					$brLabel = if ($c.Branch) { $c.Branch } else { '(detached)' }
					# Truncate subject to keep display tidy
					$subj = if ($c.Subject.Length -gt 55) { $c.Subject.Substring(0, 52) + '...' } else { $c.Subject }
					Write-Host ("  [{0}] {1}  {2}  {3,-35}  {4}" -f $num, $c.Hash, $c.Date, $brLabel, $subj)
				}

				Write-Host ''
				$pick = Read-Host '  Enter number to pull [1-5], or [X] to go back'

				if ($pick -match '^[Xx]') { continue github }

				$pickNum = 0
				if (-not [int]::TryParse($pick, [ref]$pickNum) -or $pickNum -lt 1 -or $pickNum -gt $commits.Count) {
					Write-Host "Invalid selection. Going back to the GitHub menu."
					continue github
				}

				$chosen = $commits[$pickNum - 1]
				Write-Host ''

				# Determine if chosen is the tip of a remote branch we can pull normally
				$isCurrentBranch = ($chosen.Branch -eq $branch)

				if ($isCurrentBranch) {
					# Standard pull
					Write-Host "  Pulling origin/$branch into local $branch ..."
					$pullOut = Invoke-Git @('pull', 'origin', $branch)
					$pullOut | Out-Host
					if ($LASTEXITCODE -ne 0) {
						Write-Host ''
						Write-Host 'ERROR: Pull failed. Resolve any merge conflicts manually.'
						continue github
					}
					Write-Host ''
					Write-Host "Done. Local $branch is now up to date with origin."

				} elseif ($chosen.Branch -and $chosen.Branch -ne '') {
					# Different branch - pull that branch
					Write-Host "  Pulling origin/$($chosen.Branch) ..."
					$pullOut = Invoke-Git @('fetch', 'origin', $chosen.Branch)
					$pullOut | Out-Host
					$checkOut = Invoke-Git @('checkout', '-B', $chosen.Branch, "origin/$($chosen.Branch)")
					$checkOut | Out-Host
					if ($LASTEXITCODE -ne 0) {
						Write-Host "ERROR: Could not switch to branch $($chosen.Branch)."
						continue github
					}
					Write-Host ''
					Write-Host "Done. Switched to and updated branch $($chosen.Branch)."

				} else {
					# Older commit with no branch label - create recovery branch
					$recoverBranch = "recover/$($chosen.Hash)"
					Write-Host "  Commit $($chosen.Hash) is not a current branch tip."
					Write-Host "  Creating local branch '$recoverBranch' from this commit..."
					$coOut = Invoke-Git @('checkout', '-b', $recoverBranch, $chosen.Hash)
					$coOut | Out-Host
					if ($LASTEXITCODE -ne 0) {
						Write-Host "ERROR: Could not create recovery branch."
						continue github
					}
					Write-Host ''
					Write-Host "Done. You are now on branch '$recoverBranch' at commit $($chosen.Hash)."
				}

				# Lockfile/manifest may have moved with the pull.
				Invoke-WorkspaceInstall -Root $ProjectRoot
				continue top
			}

			Write-Host '  Invalid selection. Please choose again.'
		}
	}

	# ============================================================================
	# H - HANDOFF FLOW
	#
	# One keypress for "I'm leaving this machine": commit, push, then start a
	# Claude cloud session so the work continues without this computer.
	#
	# The push is not optional politeness - a cloud session clones origin from
	# GitHub, never from this disk, so anything uncommitted is invisible to it.
	# ============================================================================
	'^[Hh]' {

		if (!(Test-GitAvailable) -or !(Test-GitRepo)) {
			Write-Host 'ERROR: Handoff needs a git repository with git available in PATH.'
			exit 1
		}
		if (-not (Get-GitRemoteUrl)) {
			Write-Host 'ERROR: No "origin" remote found. A cloud session clones from GitHub,'
			Write-Host '       so origin is required. Use [G] GitHub mode to add one first.'
			continue top
		}

		$branch = Get-GitBranch

		Write-Host ''
		Write-Host '--- Handoff ---'
		Write-Host "  Branch : $branch"
		Write-Host ''
		Write-Host '  A cloud session clones origin from GitHub, not from this disk, so'
		Write-Host '  everything you want it to see has to be committed and pushed first.'

		# ---- 1. Commit whatever is outstanding ----
		$statusLines = Get-GitStatus
		if ($statusLines.Count -gt 0) {
			Write-Host ''
			Write-Host "  $($statusLines.Count) uncommitted file(s):"
			$statusLines | Select-Object -First 10 | ForEach-Object { Write-Host "    $_" }
			if ($statusLines.Count -gt 10) { Write-Host "    ... and $($statusLines.Count - 10) more" }

			$commitMessage = Read-CommitMessage -AutoMessage (New-AutoCommitMessage -Branch $branch)
			if ($null -eq $commitMessage) {
				Write-Host 'Commit message cannot be empty. Aborted.'
				continue top
			}
			if (-not (Invoke-CommitAll -Message $commitMessage)) { continue top }
		} else {
			Write-Host ''
			Write-Host '  Working tree is clean - nothing to commit.'
		}

		# ---- 2. Push so the cloud VM has a branch to clone ----
		if (-not (Invoke-PushBranch -Branch $branch)) { continue top }
		Write-Host "  origin/$branch is up to date."

		# ---- 3. Hand the task off ----
		# Everything above is worth doing on its own, so a missing CLI is not fatal:
		# the code is safely on GitHub either way.
		if (-not (Test-ClaudeAvailable)) {
			Write-Host ''
			Write-Host '  Code is pushed, but the "claude" CLI was not found in PATH, so no'
			Write-Host '  cloud session was started. From either machine, run:'
			Write-Host '    claude --cloud "<task>"'
			continue top
		}

		Write-Host ''
		Write-Host '  What should Claude work on while you are away?'
		Write-Host '  (Press Enter alone to push only, with no cloud session.)'
		$task = Read-Host '  Task'

		if ([string]::IsNullOrWhiteSpace($task)) {
			Write-Host ''
			Write-Host "Done. origin/$branch is current - no cloud session started."
			Write-Host '  On the other machine:  git pull'
			continue top
		}

		Write-Host ''
		Write-Host '  Starting cloud session...'
		Write-Host '    Monitor  : https://claude.ai/code, the Claude mobile app, or /tasks'
		Write-Host '    Pull back: claude --teleport   (needs a clean working tree)'
		Write-Host ''
		& claude --cloud $task
		if ($LASTEXITCODE -ne 0) {
			Write-Host ''
			Write-Host '  claude --cloud exited with an error. Your code is still pushed safely.'
			Write-Host '  Cloud sessions need a claude.ai login rather than an API key:'
			Write-Host '  run "claude" then /login, and retry.'
			exit 1
		}
		continue top
	}

	# ============================================================================
	# T - PULL-IN FLOW
	#
	# The sit-down-at-the-laptop counterpart to [H]. "claude --teleport" fetches
	# the session and its branch on its own, but it refuses to run against a dirty
	# tree, and it does NOT restore dependencies after switching branches. So this
	# mode does the pre-flight, hands over to teleport, then offers pnpm install.
	# ============================================================================
	'^[Tt]' {

		if (!(Test-GitAvailable)) {
			Write-Host 'ERROR: git is not available in PATH. Install Git for Windows and retry.'
			exit 1
		}
		if (!(Test-GitRepo)) {
			Write-Host ''
			Write-Host "  $ProjectRoot is not a git repository yet."
			Write-Host '  Teleport must run from a checkout of the same repo, so clone it first:'
			Write-Host '  re-run this script and choose [G] GitHub. That flow inits the repo, adds'
			Write-Host '  origin, lets you pick a branch, and installs dependencies.'
			continue top
		}
		if (-not (Test-ClaudeAvailable)) {
			Write-Host 'ERROR: the "claude" CLI was not found in PATH. Install it, then retry.'
			exit 1
		}

		Write-Host ''
		Write-Host '--- Pull-In ---'
		Write-Host "  Repo   : $(Get-GitRemoteUrl)"
		Write-Host "  Branch : $(Get-GitBranch)"

		# ---- 1. Teleport requires a clean working tree ----
		# It will offer to stash, but a commit is far easier to find again later.
		$statusLines = Get-GitStatus
		if ($statusLines.Count -gt 0) {
			:tdirty while ($true) {
				Write-Host ''
				Write-Host "  $($statusLines.Count) uncommitted file(s) on this machine:"
				$statusLines | Select-Object -First 10 | ForEach-Object { Write-Host "    $_" }
				if ($statusLines.Count -gt 10) { Write-Host "    ... and $($statusLines.Count - 10) more" }
				Write-Host ''
				Write-Host '  [C] Commit them now (and push)'
				Write-Host '  [S] Leave them - let teleport offer to stash'
				Write-Host '  [X] Back   - return to the main menu'
				Write-Host ''
				$dirtyChoice = Read-Host '  Choose [C/S/X]'

				if ($dirtyChoice -match '^[Xx]') { continue top }

				if ($dirtyChoice -match '^[Cc]') {
					$branch        = Get-GitBranch
					$commitMessage = Read-CommitMessage -AutoMessage (New-AutoCommitMessage -Branch $branch)
					if ($null -eq $commitMessage) {
						Write-Host '  Commit message cannot be empty. Choose again or pick [X] Back.'
						continue tdirty
					}
					if (-not (Invoke-CommitAll -Message $commitMessage)) { continue tdirty }
					# A failed push is not fatal here - the commit is what unblocks teleport.
					if (-not (Invoke-PushBranch -Branch $branch)) {
						Write-Host '  Commit succeeded, push did not. Continuing to teleport anyway.'
					}
					break
				}

				if ($dirtyChoice -match '^[Ss]') { break }

				Write-Host '  Invalid selection. Please choose again.'
			}
		} else {
			Write-Host ''
			Write-Host '  Working tree is clean.'
		}

		# ---- 2. Refresh remote refs ----
		# A narrow refspec left over from a single-branch clone can hide the
		# session's branch, so widen it the same way the [G] flow does.
		$currentRefspec = ((Invoke-Git @('config', '--get', 'remote.origin.fetch')) | Out-String).Trim()
		if ($currentRefspec -and $currentRefspec -ne '+refs/heads/*:refs/remotes/origin/*') {
			Write-Host '  (Widening fetch refspec to include all branches...)'
			Invoke-Git @('config', 'remote.origin.fetch', '+refs/heads/*:refs/remotes/origin/*') | Out-Null
		}
		Write-Host '  Fetching from origin...'
		Invoke-Git @('fetch', 'origin', '--prune') | Out-Null

		# ---- 3. Flag machine-local prerequisites teleport cannot supply ----
		if (!(Test-Path (Join-Path $ProjectRoot 'packages\api\.env'))) {
			Write-Host ''
			Write-Host '  NOTE: packages/api/.env is missing here (it is gitignored, so it never'
			Write-Host '        travels). Copy packages/api/.env.example and fill it in before'
			Write-Host '        starting the API.'
		}

		# ---- 4. Hand over to teleport ----
		Write-Host ''
		Write-Host '  Opening the cloud session picker...'
		Write-Host '    Teleport checks out the session branch and loads its full history.'
		Write-Host '    If that branch moved the lockfile, ask Claude to run "pnpm install".'
		Write-Host '    Local work after this does NOT flow back to claude.ai or the mobile'
		Write-Host '    app - start /remote-control if you still want to steer from your phone.'
		Write-Host ''
		& claude --teleport
		$teleportExit = $LASTEXITCODE

		if ($teleportExit -ne 0) {
			Write-Host ''
			Write-Host '  claude --teleport exited with an error. Usual causes:'
			Write-Host '    - signed in with an API key: run "claude", then /login'
			Write-Host '    - this checkout is a fork rather than the session repo'
			Write-Host '    - the session branch was never pushed to origin'
			exit 1
		}

		# The session may have landed on a branch with a different lockfile.
		Write-Host ''
		Write-Host "  Session closed. Now on branch: $(Get-GitBranch)"
		Invoke-WorkspaceInstall -Root $ProjectRoot
		continue top
	}

	# ============================================================================
	# F - FILE COPY FLOW
	# ============================================================================
	'^[Ff]' {

		# ---- Direction: Send / Receive / Back ----
		:fdirection while ($true) {
			Write-Host ''
			Write-Host '[S] Send    - push this machine to a remote destination'
			Write-Host '[R] Receive - pull from a remote source to this machine'
			Write-Host '[X] Back   - return to the main menu'
			Write-Host ''
			$direction = Read-Host 'Direction [S/R/X]'

			if ($direction -match '^[Xx]') { continue top }
			if ($direction -match '^[SsRr]') { break }
			Write-Host '  Invalid selection. Please choose again.'
		}
		$isSending = $direction -match '^[Ss]'

		# ---- Target type: Network / Machine / USB / Back ----
		:ftarget while ($true) {
			Write-Host ''
			Write-Host '[N] Network drive    (mapped letter, e.g. M:\Dev-Sync)'
			Write-Host '[M] Machine share    (UNC path,      e.g. \\DESKTOP-ABC\Dev-Sync)'
			Write-Host '[U] USB / external   (drive letter,  e.g. E:\Dev-Sync)'
			Write-Host '[X] Back   - choose Send/Receive again'
			Write-Host ''
			$targetType = Read-Host 'Target type [N/M/U/X]'

			if ($targetType -match '^[Xx]') { continue fdirection }

			if ($targetType -match '^[Nn]') {
				$defaultPath = 'M:\Dev-Sync'
				$userInput   = Read-Host "Network drive path (Enter for $defaultPath)"
				$remotePath  = if ([string]::IsNullOrWhiteSpace($userInput)) { $defaultPath } else { $userInput }
				break
			}
			if ($targetType -match '^[Mm]') {
				$machineName = Read-Host 'Machine name or IP (e.g. DESKTOP-ABC or 192.168.1.50)'
				if ([string]::IsNullOrWhiteSpace($machineName)) {
					Write-Host '  Machine name is required. Choose again or pick [X] Back.'
					continue
				}
				$defaultShare = 'Dev-Sync'
				$userInput    = Read-Host "Share name (Enter for $defaultShare)"
				$shareName    = if ([string]::IsNullOrWhiteSpace($userInput)) { $defaultShare } else { $userInput }
				$remotePath   = "\\$machineName\$shareName"
				break
			}
			if ($targetType -match '^[Uu]') {
				$userInput = Read-Host 'USB / external drive path (e.g. E:\Dev-Sync)'
				if ([string]::IsNullOrWhiteSpace($userInput)) {
					Write-Host '  Path is required. Choose again or pick [X] Back.'
					continue
				}
				$remotePath = $userInput
				break
			}

			Write-Host '  Invalid selection. Please choose again.'
		}

		$remoteProjectRoot = Join-Path $remotePath $ProjectName

		if (!$isSending -and !(Test-Path $remoteProjectRoot)) {
			Write-Host ''
			Write-Host "  Remote project not found: $remoteProjectRoot"
			Write-Host '  Check the path, or pick [X] Back to choose again.'
			continue ftarget
		}

		Write-Host ''
		Write-Host '--- File comparison ---'
		Write-Host "  Local  : $ProjectRoot"
		Write-Host "  Remote : $remoteProjectRoot"

		$localIndex  = Get-FileIndex -Root $ProjectRoot       -DirList $ExcludeDirs -FileList $ExcludeFiles
		$remoteIndex = Get-FileIndex -Root $remoteProjectRoot -DirList $ExcludeDirs -FileList $ExcludeFiles
		Show-DiffSummary -LocalIndex $localIndex -RemoteIndex $remoteIndex

		if ($isSending) {
			$source      = $ProjectRoot
			$destination = $remoteProjectRoot
			$label       = "SEND:  $ProjectRoot  -->  $remoteProjectRoot"
		} else {
			$source      = $remoteProjectRoot
			$destination = $ProjectRoot
			$label       = "RECEIVE:  $remoteProjectRoot  -->  $ProjectRoot"
		}

		Write-Host ''
		Write-Host $label
		Write-Host ''
		Write-Host "  Skipping dirs : $($ExcludeDirs -join ', ')"
		Write-Host "  Skipping files: $($ExcludeFiles -join ', ')"
		Write-Host ''
		Write-Host 'WARNING: /MIR will DELETE files at the destination that do not exist at the source.'
		Write-Host '         Excluded items (node_modules, dist, .git) are left untouched.'
		$confirm = Read-Host 'Continue? [Y/N] (anything else goes back)'
		if ($confirm -notmatch '^[Yy]') { continue ftarget }

		Write-Host ''
		Write-Host 'Syncing...'
		Invoke-RoboSync -Source $source -Destination $destination -DirList $ExcludeDirs -FileList $ExcludeFiles
		Write-Host ''
		Write-Host 'Done.'

		# A received tree has no node_modules and (unless -IncludeEnv) no .env.
		if (!$isSending) {
			if (-not $IncludeEnv) {
				Write-Host ''
				Write-Host '  NOTE: .env was not copied. Create packages/api/.env from'
				Write-Host '        packages/api/.env.example before starting the API.'
			}
			Invoke-WorkspaceInstall -Root $ProjectRoot
		}
		continue top
	}

	# ============================================================================
	# Q - QUIT
	# ============================================================================
	'^[Qq]' {
		Write-Host 'Bye.'
		exit 0
	}

	default {
		Write-Host 'Invalid selection. Please choose again.'
	}

	} # end switch

} # end :top while
