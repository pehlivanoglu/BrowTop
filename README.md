# BrowTop - a Browser-based System Performance Monitor

BrowTop is a graphical user interface for visualizing your server's System Information such as active processes, CPU and memory usage, active users etc.

## How to run BrowTop
1. You can create locally-trusted TLS certificates by running the following command:
```bash
mkcert -install
mkcert -key-file cert/localhost.key -cert-file cert/localhost.crt slocalhost
```

2. Since it is dockerized, simple compose command is enough to run:
```bash
docker compose up -d # -d detached mode 
```

This command will start the browtop server on ```https://localhost:1006```

BrowTop monitor is hosted on ```https://localhost:1006/monitor```

> **_NOTE:_**  The default password is "395". Can be changed from docker-compose.yml, declared as environment variable.

## Brief Documentation
### 1 - monitor.html:
The frontend of the BrowTop monitor. Displays system information and active processes in a browser.

**Key Features:**

1.  **Dynamic Display:**
    -   Shows a table of active processes and system metrics like CPU, memory, and disk usage.
    -   Includes progress bars for visualizing CPU, memory, and disk utilization.
2.  **Interactive Elements:**
    -   Sortable columns for process data.
    -   A toggle button to switch between "Process List" and "System Logs."
3.  **Real-Time Updates:**
    -   Uses WebSocket communication to fetch system statistics and update the UI every second.
4.  **Authentication:**
    -   Prompts the user for a password for WebSocket authentication
5. **WebSocket Routes:**
	-   `/ws` for system statistics.
	-   `/monitor` serves the `monitor.html` file.
	-   `/hello` for a basic test response.


### 2 - server.py:
Backend WebSocket server to collect and send system information to the frontend.

**Key Features:**
1.  **System Data Collection:**
    -   Retrieves process details, system metrics (CPU, memory, disk), logged-in users, system uptime, and last system logs.
2.  **WebSocket Communication:**
    -   Handles real-time communication with the frontend (`monitor.html`).
    -   Authenticates the client using a password.
3.  **Utilities:**
    -   Defines helper functions for process information, system statistics, process summaries, and log retrieval.
4.  **Secure WebSocket Connection:**
    -   Uses TLS for encrypted communication.
5.  **Structure:**
    -   Defines asynchronous functions to collect data and handle WebSocket connections.
    -   Runs the server using `aiohttp`'s `web.Application`.

### 3 - docker-compose.yml
Defines the Docker service for BrowTop.

**Key Features:**

1.  **Service Configuration:**    
    -   Configures the `browtop-azra-ahmet` container.
2.  **Host Integration:**
    -   Mounts host files (`/var/run/utmp`, `/var/log/wtmp`, `/var/log/syslog`) for access to system logs and user information.
    -   Comment ```pid: host``` part in docker-compose.yml to just get docker container's process list.
3.  **Networking:**
    -   Maps port `1006` on the host to port `8765` in the container.
4.  **Environment Variables:**
    -   Passes SSL certificate paths and server password to the container.

## Contributors
- Azra Açıl (github.com/azraa4)
- Ahmet Pehlivanoğlu (github.com/pehlivanoglu)