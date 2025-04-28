# Welcome to your Pathway to Property Investment 

## Project info

**URL**: https://github.com/lachho/property-path/

**Features**
- 2 Lead generation features through simple calculators with a call to action to draw in customers
- Client management system for brokers to visualise and analyse client data

## CI/CD and Dependency Locking

- **Frontend**: Uses npm. Only `package-lock.json` is supported. If you see `bun.lockb`, delete it.
- **Backend**: Uses Maven. Dependency locking is enabled via the `reproducible-build-maven-plugin`. To update the lock file, run:
  ```sh
  mvn io.github.zlika:reproducible-build-maven-plugin:lock-dependencies
  ```
- **Testing**: Placeholder tests are present in both frontend and backend to ensure CI passes. Replace them with real tests as you develop.