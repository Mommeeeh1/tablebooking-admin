type Constructor<T = {}> = new (...args: any[]) => T

class Container {
  private services = new Map<string, any>()

  register<T>(key: string, implementation: Constructor<T> | T): void {
    this.services.set(key, implementation)
  }

  // If registered value is a class, instantiate it; otherwise return as-is
  resolve<T>(key: string): T {
    const service = this.services.get(key)

    if (!service) {
      throw new Error(`Service ${key} not found in container`)
    }

    if (typeof service === 'function') {
      return new service() as T
    }

    return service as T
  }

  has(key: string): boolean {
    return this.services.has(key)
  }
}

export const container = new Container()
