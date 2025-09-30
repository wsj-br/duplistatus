# AI Development

![duplistatus](../img/duplistatus_banner.png)

How duplistatus was built using AI tools and the development process.

## Motivation

I started using Duplicati as a backup tool for my home servers. I tried the official [Duplicati dashboard](https://app.duplicati.com/) and [Duplicati Monitoring](https://www.duplicati-monitoring.com/), but I had two main requirements: (1) self-hosted; and (2) an API exposed for integration with [Homepage](https://gethomepage.dev/), as I use it for my home lab's homepage.

I also tried connecting directly to each Duplicati server on the network, but the authentication method was not compatible with Homepage (or I was not able to configure it properly).

Since I was also experimenting with AI code tools, I decided to try using AI to build this tool. Here is the process I used...

## Tools Used

### Primary AI Tools
- **Claude (Anthropic)**: Primary coding assistant for architecture and implementation
- **GitHub Copilot**: Code completion and suggestions
- **ChatGPT**: Alternative perspective and problem-solving
- **Cursor**: AI-powered code editor with integrated AI assistance

### Development Tools
- **Next.js**: React framework for the web application
- **TypeScript**: Type-safe JavaScript development
- **SQLite**: Lightweight database for data storage
- **Docker**: Containerization for deployment
- **Tailwind CSS**: Utility-first CSS framework

## Development Process

### Phase 1: Planning and Architecture

#### Initial Requirements Analysis
I started by clearly defining the requirements:

1. **Core Functionality**:
   - Monitor multiple Duplicati servers
   - Display backup status and history
   - Provide API endpoints for external integration
   - Support notifications for backup failures

2. **Technical Requirements**:
   - Self-hosted solution
   - Docker containerization
   - RESTful API
   - Real-time dashboard
   - Database for backup data storage

#### AI-Assisted Architecture Design
Using Claude, I designed the system architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Duplicati     │    │   duplistatus   │    │   Homepage      │
│   Servers       │───▶│   Application   │◀───│   Dashboard     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   SQLite        │
                       │   Database      │
                       └─────────────────┘
```

### Phase 2: Implementation

#### Backend Development
The backend was developed using AI assistance for:

1. **API Endpoint Design**:
   ```typescript
   // AI-generated API structure
```typescript
interface BackupAPI {
  getServers(): Promise<Server[]>;
  getServerDetails(id: number): Promise<ServerDetails>;
  uploadBackupData(data: BackupData): Promise<void>;
  getDashboardData(): Promise<DashboardData>;
}
```
   ```

2. **Database Schema**:
   ```sql
   -- AI-suggested database structure
   CREATE TABLE servers (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL UNIQUE,
     alias TEXT,
     notes TEXT,
     last_seen DATETIME,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. **Data Processing Logic**:
   ```typescript
   // AI-generated backup data processing
   class BackupProcessor {
     async processBackupData(rawData: any): Promise<BackupRecord> {
       // AI-suggested data transformation logic
       return {
         serverId: this.extractServerId(rawData),
         backupName: rawData.backup.name,
         status: this.normalizeStatus(rawData.backup.status),
         startTime: new Date(rawData.backup.startTime),
         // ... more fields
       };
     }
   }
   ```

#### Frontend Development
The frontend was built with AI assistance for:

1. **Component Architecture**:
   ```typescript
```tsx
// AI-suggested component structure
interface DashboardProps {
  servers: Server[];
  onServerSelect: (server: Server) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ servers, onServerSelect }) => {
  // AI-generated component logic
  return (
    <div className="dashboard">
      {servers.map(server => (
        <ServerCard
          key={server.id}
          server={server}
          onClick={() => onServerSelect(server)}
        />
      ))}
    </div>
  );
};
```
   ```

2. **State Management**:
   ```typescript
   // AI-suggested state management
   interface AppState {
     servers: Server[];
     selectedServer: Server | null;
     dashboardData: DashboardData | null;
     loading: boolean;
     error: string | null;
   }
   ```

3. **API Integration**:
   ```typescript
   // AI-generated API client
   class APIClient {
     private baseURL: string;
     
     constructor(baseURL: string) {
       this.baseURL = baseURL;
     }
     
     async get<T>(endpoint: string): Promise<T> {
       const response = await fetch(`${this.baseURL}${endpoint}`);
       if (!response.ok) {
         throw new Error(`API Error: ${response.status}`);
       }
       return response.json();
     }
   }
   ```

### Phase 3: Testing and Refinement

#### AI-Assisted Testing
AI tools helped generate comprehensive tests:

```typescript
// AI-generated test cases
describe('BackupProcessor', () => {
  it('should process valid backup data correctly', async () => {
    const rawData = {
      server: { name: 'test-server' },
      backup: {
        name: 'daily-backup',
        status: 'Success',
        startTime: '2024-01-15T02:00:00Z'
      }
    };
    
    const processor = new BackupProcessor();
    const result = await processor.processBackupData(rawData);
    
    expect(result.serverName).toBe('test-server');
    expect(result.backupName).toBe('daily-backup');
    expect(result.status).toBe('success');
  });
});
```

#### Code Review and Optimization
AI tools assisted with:

1. **Code Review**: Identifying potential issues and improvements
2. **Performance Optimization**: Suggesting optimizations for database queries and API calls
3. **Security Review**: Identifying potential security vulnerabilities
4. **Documentation**: Generating comprehensive code documentation

### Phase 4: Deployment and DevOps

#### Docker Configuration
AI helped create the Docker setup:

```dockerfile
# AI-generated Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8666

CMD ["npm", "start"]
```

#### CI/CD Pipeline
AI suggested GitHub Actions workflow:

```yaml
# AI-generated GitHub Actions
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run build
```

## AI Development Benefits

### Advantages
1. **Rapid Prototyping**: AI enabled quick iteration and experimentation
2. **Code Quality**: AI suggestions improved code structure and best practices
3. **Documentation**: AI helped generate comprehensive documentation
4. **Testing**: AI assisted in creating thorough test coverage
5. **Problem Solving**: AI provided alternative approaches to complex problems

### Challenges
1. **Context Limitations**: AI sometimes lacked full project context
2. **Code Consistency**: Ensuring consistent coding style across AI-generated code
3. **Debugging**: AI-generated code sometimes required significant debugging
4. **Dependencies**: Managing AI-suggested dependencies and their compatibility

## Lessons Learned

### What Worked Well
1. **Iterative Development**: Using AI for rapid prototyping and iteration
2. **Code Generation**: AI was excellent for boilerplate code and common patterns
3. **Documentation**: AI helped maintain comprehensive documentation
4. **Testing**: AI-generated tests provided good coverage

### What Could Be Improved
1. **Architecture Decisions**: Human oversight was crucial for architectural choices
2. **Domain Knowledge**: AI lacked specific knowledge about Duplicati and backup systems
3. **Integration Testing**: AI-generated code needed thorough integration testing
4. **Performance**: Some AI-suggested solutions needed performance optimization

## Best Practices for AI Development

### 1. Clear Requirements
- Define clear, specific requirements
- Break down complex problems into smaller tasks
- Provide context about the domain and constraints

### 2. Iterative Approach
- Start with simple implementations
- Gradually add complexity
- Test each iteration thoroughly

### 3. Human Oversight
- Review all AI-generated code
- Make architectural decisions based on experience
- Validate AI suggestions against project requirements

### 4. Testing and Validation
- Test AI-generated code extensively
- Validate functionality against requirements
- Perform integration testing

### 5. Documentation
- Document AI-assisted development process
- Maintain clear code documentation
- Keep track of AI-generated vs. human-written code

## Future AI Development

### Potential Improvements
1. **Better Context Awareness**: AI tools with better project context
2. **Domain-Specific Training**: AI trained on specific domains (backup systems)
3. **Integration Testing**: AI tools that can generate and run integration tests
4. **Performance Optimization**: AI that can automatically optimize code performance

### Tools to Explore
1. **GitHub Copilot X**: Enhanced AI coding assistant
2. **Cursor**: AI-powered code editor
3. **Replit AI**: AI-powered development environment
4. **Tabnine**: AI code completion tool

## Conclusion

Building duplistatus with AI tools was a successful experiment that demonstrated the potential of AI-assisted development. While AI tools provided significant value in code generation, testing, and documentation, human oversight and domain expertise remained crucial for making architectural decisions and ensuring the final product met the requirements.

The project serves as a case study for how AI can accelerate development while maintaining code quality and functionality. The combination of AI assistance and human expertise resulted in a robust, well-documented application that successfully meets its original requirements.

## Resources

### AI Development Tools
- [Claude (Anthropic)](https://claude.ai/)
- [GitHub Copilot](https://github.com/features/copilot)
- [Cursor](https://cursor.sh/)
- [ChatGPT](https://chat.openai.com/)

### Development Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
