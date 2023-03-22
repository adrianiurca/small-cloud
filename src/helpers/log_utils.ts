/* tslint:disable:no-console */
export default function LOG(message: string): void {
  if(process.env.ENVIRONMENT === 'development') {
    console.log('\x1b[32m%s\x1b[0m', '########## LOG START ##########')
    console.log(message)
    console.log('\x1b[32m%s\x1b[0m', '########## LOG END   ##########')
  }
}
