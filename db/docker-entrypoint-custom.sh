#!/bin/bash
set -e

# Signal handler for proper shutdown
shutdown() {
  echo "Received SIGTERM or SIGINT, shutting down PostgreSQL gracefully..."
  # Use PG_VERSION to determine the PostgreSQL data directory
  PGDATA="${PGDATA:-/var/lib/postgresql/data}"
  if [ -f "$PGDATA/PG_VERSION" ]; then
    # Terminate all active connections and shut down cleanly
    su-exec postgres pg_ctl stop -m fast
  fi
  exit 0
}

# Set up trap for graceful shutdown
trap shutdown SIGTERM SIGINT

# Run the official entrypoint
source /usr/local/bin/docker-entrypoint.sh "$@" &

# Store child process PID
CHILD_PID=$!

# Wait for the child process
wait $CHILD_PID 