const shellImport = import('shelljs')

const shell = async () => {
  try {
    const response = (await shellImport).default
    return response
  } catch (error) {
    throw error
  }
}

const exec = (command: string) => {
  return new Promise<{ code: number; stdout: string }>(
    async (
      resolve: (value: { code: number; stdout: string }) => void,
      reject: (reason: { code: number; stderr: string }) => void
    ) => {
      const execFunction = (await shell()).exec
      execFunction(
        command,
        { async: true, silent: true },
        (code, stdout, stderr) => {
          if (code !== 0) {
            return reject({ code, stderr })
          } else {
            return resolve({ code, stdout })
          }
        }
      )
    }
  )
}

const mkdir = async (path: string) => {
  try {
    const mkdirFunction = (await shell()).mkdir
    mkdirFunction(path)
  } catch (error) {
    throw new Error(`mkdir failed with ${error}`)
  }
}

const chmod = async (value: number, path: string) => {
  try {
    const chmodFunction = (await shell()).chmod
    chmodFunction(value, path)
  } catch (error) {
    throw error
  }
}

const rm = async (files: string[], options: string = undefined) => {
  try {
    const rmFunction = (await shell()).rm
    if (options) {
      rmFunction(options, files)
    } else {
      rmFunction(files)
    }
  } catch (error) {
    throw error
  }
}

export default { exec, mkdir, chmod, rm }
