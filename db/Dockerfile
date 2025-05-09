FROM postgres:15-alpine

# Add custom postgresql.conf with faster shutdown settings
COPY postgresql.conf /etc/postgresql/postgresql.conf

# Add script to handle shutdown gracefully
COPY docker-entrypoint-custom.sh /usr/local/bin/

# Make the custom entrypoint script executable
RUN chmod +x /usr/local/bin/docker-entrypoint-custom.sh

# Set the custom entrypoint script
ENTRYPOINT ["docker-entrypoint-custom.sh"]

# Command to run when container starts
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"] 