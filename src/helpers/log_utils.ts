export default function log(message: string): void {
  console.log('\x1b[32m%s\x1b[0m', '########## LOG START ##########')
  console.log(message);
  console.log('\x1b[32m%s\x1b[0m', '########## LOG END ##########')
}
