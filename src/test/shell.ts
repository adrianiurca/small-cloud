const shellImport = import('shelljs')

const shell = async () => {
  try {
    const response = (await shellImport).default
    return response
  } catch (error) {
    throw error
  }
}

export default shell
