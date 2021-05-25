import * as shell from 'shelljs'

// copy all the view templates
shell.cp('-R', 'src/views', 'dist/')

// copy all tasks
shell.cp('-R', 'src/tasks', 'dist/')

// copy all templates
shell.cp('-R', 'src/templates', 'dist/')

// copy db.json
shell.cp('-R', 'src/db', 'dist/')