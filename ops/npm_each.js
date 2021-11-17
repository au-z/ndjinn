const fs = require('fs')
const path = require('path')
const cp = require('child_process')
const os = require('os')

const cmd = process.argv.slice(2)
if(!cmd) throw new Error('No npm command provided.')

;(function buildRecurse(dir) {

	fs.readdirSync(dir).forEach((mod) => {
		const modPath = path.join(dir, mod)
		if (fs.lstatSync(modPath).isDirectory() && !modPath.includes('node_modules')) buildRecurse(modPath)
		// ensure path has package.json
		if (!fs.existsSync(path.join(modPath, 'package.json'))) return
	
		// npm binary based on OS
		const npm = os.platform().startsWith('win') ? 'npm.cmd' : 'npm'
	
		// install folder
		console.log(`Running 'npm ${cmd.join(' ')}' from ${modPath.replace(process.cwd(), '')}...`)
		cp.spawn(npm, cmd, { env: process.env, cwd: modPath, stdio: 'inherit' })
	})
})(path.resolve(process.cwd()))
