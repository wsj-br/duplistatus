# Troubleshooting

![duplistatus](../img/duplistatus_banner.png)

Common issues and solutions for duplistatus installation, configuration, and operation.

## Common Issues

### Installation Issues

#### Container Won't Start
**Symptoms**: Container fails to start or exits immediately

**Possible Causes**:
- Port 9666 already in use
- Insufficient system resources
- Docker configuration issues
- Image corruption

**Solutions**:
1. **Check port availability**:
   ```bash
   netstat -tulpn | grep 9666
   ```
2. **Check container logs**:
   ```bash
   docker logs duplistatus
   ```
3. **Verify system resources**:
   ```bash
   docker system df
   free -h
   ```
4. **Recreate container**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

#### Can't Access Web Interface
**Symptoms**: Browser shows connection error or timeout

**Possible Causes**:
- Firewall blocking port 9666
- Container not running
- Wrong IP address or port
- Network configuration issues

**Solutions**:
1. **Verify container status**:
   ```bash
   docker ps | grep duplistatus
   ```
2. **Check port mapping**:
   ```bash
   docker port duplistatus
   ```
3. **Test local connectivity**:
   ```bash
   curl http://localhost:9666
   ```
4. **Check firewall rules**:
   ```bash
   sudo ufw status
   sudo iptables -L
   ```

### Configuration Issues

#### Duplicati Server Not Appearing
**Symptoms**: Duplicati server doesn't show up in dashboard

**Possible Causes**:
- Duplicati server not configured to send reports
- Network connectivity issues
- Firewall blocking communication
- Wrong URL configuration

**Solutions**:
1. **Verify Duplicati configuration**:
   - Check `send-http-url` setting
   - Verify `send-http-result-output-format` is set to `Json`
   - Ensure `send-http-log-level` is set to `Information`

2. **Test connectivity**:
   ```bash
   curl -X POST http://your-duplistatus-server:9666/api/upload \
     -H "Content-Type: application/json" \
     -d '{"test": "connection"}'
   ```

3. **Check network connectivity**:
   ```bash
   ping your-duplistatus-server
   telnet your-duplistatus-server 9666
   ```

4. **Review duplistatus logs**:
   ```bash
   docker logs duplistatus | grep -i error
   ```

#### Missing Backup Data
**Symptoms**: Dashboard shows servers but no backup information

**Possible Causes**:
- Backup jobs not running
- Duplicati server configuration issues
- Data collection problems
- Database issues

**Solutions**:
1. **Check backup job status**:
   - Verify backup jobs are scheduled and running
   - Check Duplicati server logs
   - Ensure backup jobs are configured correctly

2. **Manual log collection**:
   - Go to **Settings** → **Database Maintenance** → **Collect Logs**
   - Select servers and start collection
   - Monitor collection progress

3. **Verify database**:
   ```bash
   docker exec -it duplistatus sqlite3 /app/data/backups.db ".tables"
   ```

4. **Check data collection logs**:
   ```bash
   docker logs duplistatus | grep -i "collect\|upload"
   ```

### Performance Issues

#### Slow Dashboard Loading
**Symptoms**: Dashboard takes a long time to load

**Possible Causes**:
- Large database size
- Insufficient system resources
- Network latency
- Database optimization issues

**Solutions**:
1. **Check database size**:
   ```bash
   docker exec -it duplistatus ls -lh /app/data/backups.db
   ```

2. **Monitor system resources**:
   ```bash
   docker stats duplistatus
   ```

3. **Optimize database**:
   - Go to **Settings** → **Database Maintenance**
   - Clean old backup logs
   - Remove unnecessary data

4. **Check network performance**:
   ```bash
   ping your-duplistatus-server
   traceroute your-duplistatus-server
   ```

#### High Memory Usage
**Symptoms**: Container using excessive memory

**Possible Causes**:
- Memory leaks
- Large dataset processing
- Inefficient queries
- Resource limits

**Solutions**:
1. **Monitor memory usage**:
   ```bash
   docker stats duplistatus
   ```

2. **Check for memory leaks**:
   ```bash
   docker logs duplistatus | grep -i "memory\|leak"
   ```

3. **Optimize data processing**:
   - Reduce data collection frequency
   - Clean old data regularly
   - Optimize database queries

4. **Adjust resource limits**:
   ```yaml
   services:
     duplistatus:
       # ... other configuration
       deploy:
         resources:
           limits:
             memory: 512M
           reservations:
             memory: 256M
   ```

### Notification Issues

#### Notifications Not Sending
**Symptoms**: No notifications received despite configuration

**Possible Causes**:
- Incorrect notification configuration
- Network connectivity issues
- Service authentication problems
- Rate limiting

**Solutions**:
1. **Test notification configuration**:
   - Go to **Settings** → **Notifications**
   - Use "Test Notifications" feature
   - Check notification logs

2. **Verify NTFY configuration**:
   - Check NTFY server URL
   - Verify topic name
   - Test NTFY connectivity

3. **Check email configuration**:
   - Verify SMTP settings
   - Test email connectivity
   - Check spam folders

4. **Review notification logs**:
   ```bash
   docker logs duplistatus | grep -i "notification\|ntfy\|email"
   ```

#### Too Many Notifications
**Symptoms**: Receiving excessive notifications

**Possible Causes**:
- Overly sensitive notification settings
- Multiple notification channels
- False positive alerts
- Notification loops

**Solutions**:
1. **Adjust notification sensitivity**:
   - Increase grace periods
   - Reduce notification frequency
   - Configure quiet hours

2. **Review notification settings**:
   - Check per-backup notification settings
   - Verify global notification configuration
   - Disable unnecessary notifications

3. **Implement notification filtering**:
   - Use notification templates
   - Configure notification rules
   - Set up notification priorities

## Diagnostic Tools

### Log Analysis

#### Container Logs
```bash
# View all logs
docker logs duplistatus

# Follow logs in real-time
docker logs -f duplistatus

# Filter logs by keyword
docker logs duplistatus | grep -i "error\|warning\|failed"

# View logs with timestamps
docker logs -t duplistatus
```

#### Application Logs
```bash
# Access container shell
docker exec -it duplistatus /bin/bash

# View application logs
tail -f /app/logs/app.log

# Check error logs
grep -i "error" /app/logs/app.log
```

### Database Diagnostics

#### Database Health Check
```bash
# Access database
docker exec -it duplistatus sqlite3 /app/data/backups.db

# Check database integrity
PRAGMA integrity_check;

# View database schema
.schema

# Check table sizes
SELECT name, COUNT(*) FROM sqlite_master WHERE type='table';
```

#### Performance Analysis
```bash
# Check slow queries
EXPLAIN QUERY PLAN SELECT * FROM backups WHERE server_id = 1;

# Analyze database statistics
ANALYZE;

# Check index usage
PRAGMA index_list(backups);
```

### Network Diagnostics

#### Connectivity Testing
```bash
# Test local connectivity
curl -v http://localhost:9666

# Test remote connectivity
curl -v http://your-server:9666

# Test API endpoints
curl -X GET http://localhost:9666/api/servers
```

#### Port and Service Testing
```bash
# Check if port is open
nmap -p 9666 your-server

# Test service response
telnet your-server 9666

# Check service status
systemctl status docker
```

## Recovery Procedures

### Data Recovery

#### Database Backup
```bash
# Create database backup
docker exec duplistatus cp /app/data/backups.db /app/data/backups.db.backup

# Copy backup to host
docker cp duplistatus:/app/data/backups.db.backup ./backups.db.backup
```

#### Database Restore
```bash
# Stop container
docker-compose down

# Restore database
docker cp ./backups.db.backup duplistatus:/app/data/backups.db

# Start container
docker-compose up -d
```

### Service Recovery

#### Container Recovery
```bash
# Restart container
docker-compose restart duplistatus

# Recreate container
docker-compose down
docker-compose up -d

# Clean restart
docker-compose down
docker system prune -f
docker-compose up -d
```

#### Data Recovery
```bash
# Check volume status
docker volume ls | grep duplistatus

# Inspect volume
docker volume inspect duplistatus_data

# Recover from volume
docker run --rm -v duplistatus_data:/data -v $(pwd):/backup alpine tar czf /backup/duplistatus-data.tar.gz -C /data .
```

## Prevention Strategies

### Regular Maintenance

#### Daily Tasks
- Check dashboard for errors
- Monitor system resources
- Review notification status
- Verify backup operations

#### Weekly Tasks
- Clean old backup logs
- Review system performance
- Update documentation
- Test backup procedures

#### Monthly Tasks
- Database optimization
- Security updates
- Performance analysis
- Capacity planning

### Monitoring Setup

#### System Monitoring
- Set up system resource monitoring
- Configure alerting for resource usage
- Monitor container health
- Track performance metrics

#### Application Monitoring
- Monitor application logs
- Set up error alerting
- Track user activity
- Monitor API usage

#### Backup Monitoring
- Verify backup completion
- Monitor backup performance
- Track storage usage
- Alert on backup failures

## Getting Help

### Documentation Resources
- **Installation Guide**: [Getting Started](../getting-started/installation.md)
- **Configuration Guide**: [Duplicati Configuration](../getting-started/configuration.md)
- **User Guide**: [Complete User Guide](overview.md)
- **API Reference**: [API Documentation](../api-reference/overview.md)

### Community Support
- **GitHub Issues**: [Report bugs or request features](https://github.com/wsj-br/duplistatus/issues)
- **GitHub Discussions**: [Community support and questions](https://github.com/wsj-br/duplistatus/discussions)
- **Documentation**: [Project documentation](https://github.com/wsj-br/duplistatus/tree/main/docs)

### Professional Support
- **Enterprise Support**: Contact for enterprise-level support
- **Consulting Services**: Available for custom implementations
- **Training**: Available for team training and onboarding

## Best Practices

### System Administration
- **Regular Backups**: Backup your duplistatus database regularly
- **Monitoring**: Set up comprehensive monitoring
- **Documentation**: Keep detailed documentation of your setup
- **Testing**: Regularly test your backup and recovery procedures

### Security
- **Access Control**: Implement proper access controls
- **Network Security**: Secure network communications
- **Data Protection**: Protect sensitive backup data
- **Audit Logging**: Enable comprehensive audit logging

### Performance
- **Resource Management**: Monitor and manage system resources
- **Database Optimization**: Regularly optimize your database
- **Network Optimization**: Optimize network performance
- **Capacity Planning**: Plan for future capacity needs
