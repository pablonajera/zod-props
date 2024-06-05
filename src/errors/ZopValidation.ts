export class ZopError extends Error {
  constructor (componentName: string, errors: string) {
    super(`Found in ${componentName}:\n${errors}`)
    this.name = 'ZopError'
  }
}
