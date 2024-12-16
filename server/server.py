import asyncio
from datetime import datetime
import json
import pathlib
import ssl
import os

import psutil
from aiohttp import web

def get_process_info(proc):
    """
    Extracts information about a process.
    """
    try:
        info = proc.info
        return {
            "user": info.get("username"),
            "pid": info.get("pid"),
            "cpu": f"{info.get('cpu_percent', 0):.1f}",
            "memory": f"{info.get('memory_percent', 0):.1f}",
            "vsz": f"{info.get('memory_info').vms // 1024}" if info.get("memory_info") else "0",
            "rss": f"{info.get('memory_info').rss // 1024}" if info.get("memory_info") else "0",
            "tty": "?",
            "stat": info.get("status", "?")[0].upper(),
            "start": datetime.fromtimestamp(info.get("create_time", 0)).strftime("%H:%M"),
            "time": f"{info.get('cpu_times').user+info.get('cpu_times').system}" if info.get("cpu_times") else "0",
            "command": info.get("name"),
        }
    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
        return {
            "user": "N/A",
            "pid": "N/A",
            "cpu": "N/A",
            "memory": "N/A",
            "vsz": "N/A",
            "rss": "N/A",
            "tty": "N/A",
            "stat": "N/A",
            "start": "N/A",
            "time": "N/A",
            "command": "N/A",
        }

async def list_of_processes():
    """
    Asynchronously retrieves a list of processes with their details.
    """
    tasks = []
    for proc in psutil.process_iter(['username', 'pid', 'cpu_percent', 'memory_percent', 'memory_info', 'status', 'create_time', 'name', 'cpu_times']):
        tasks.append(asyncio.to_thread(get_process_info, proc))

    results = await asyncio.gather(*tasks)
    return [result for result in results if result is not None]


async def hello(request):
    text = "Hello"
    return web.Response(text=text)


async def monitor(request):
    path = pathlib.Path(__file__).parents[0].joinpath("monitor.html")
    print("Serving {path}".format(path=path))
    return web.FileResponse(path)


async def get_system_stats():
    """Collect system statistics."""
    stats = {
        "cpu": psutil.cpu_percent(interval=1),
        "memory": psutil.virtual_memory()._asdict(),
        "disk": psutil.disk_usage("/")._asdict(),
        "load_avg": psutil.getloadavg(),
    }
    return stats

def process_summary():
    processes = list(psutil.process_iter())
    states = {'running': 0, 'sleeping': 0, 'stopped': 0, 'zombie': 0, 'idle': 0, 'other': 0}
    for proc in processes:
        try:
            state = proc.status()
            if state in states:
                states[state] += 1
            else:
                states['other'] += 1
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    return {"total_processes": len(processes), "states": states}

def get_logged_in_users():
    users = psutil.users()
    return [{"name": u.name, "terminal": u.terminal} for u in users]

def last_system_log_lines():
    try:
        with open('/var/log/syslog', 'r') as syslog_file:
            lines = syslog_file.readlines()
        return lines[-20:]
    except FileNotFoundError:
        return ["System log file not found."]

def last_users_logged():
    try:
        logins = os.popen("last -n 20").read()
        users = []
        seen = set()  # To track unique users
        
        for line in logins.strip().split("\n"):
            columns = line.split()
            if len(columns) < 2:
                continue  
            
            if columns[-1] == "in" or columns[-1] == "running":
                continue
            
            user = {"name": columns[0], "terminal": columns[1]}
            unique_key = (columns[0], columns[1])
            if unique_key not in seen:
                seen.add(unique_key)
                users.append(user)
        
        return users[:-1] #ignore wtmp begins line
    
    except Exception as e:
        return f"Error fetching last logged users: {str(e)}"
    
def system_uptime():
    uptime_seconds = psutil.boot_time()
    uptime = datetime.now() - datetime.fromtimestamp(uptime_seconds)
    days, remainder = divmod(uptime.total_seconds(), 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes, _ = divmod(remainder, 60)
    return f"{int(days)}d {int(hours)}h {int(minutes)}m"

async def send_stats(request):
    """Send system stats to WebSocket client."""
    print("Client connected")
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    async for msg in ws:
        if msg.type == web.WSMsgType.text and msg.data == "stats":
            data = await get_system_stats()
            response = ["stats", data]
            await ws.send_str(json.dumps(response))
        elif msg.type == web.WSMsgType.binary:
            # Ignore binary messages
            continue
        elif msg.type == web.WSMsgType.close:
            break

    return ws


def create_ssl_context():
    """Create SSL context for secure WebSocket connection."""
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    cert_file = pathlib.Path(__file__).parents[1].joinpath("app/cert/localhost.crt")
    key_file = pathlib.Path(__file__).parents[1].joinpath("app/cert/localhost.key")
    ssl_context.load_cert_chain(cert_file, key_file)
    return ssl_context


def run():
    """Start WebSocket server."""
    # ssl_context = create_ssl_context()
    app = web.Application()
    app.add_routes(
        [
            web.get("/ws", send_stats),
            web.get("/monitor", monitor),
            web.get("/hello", hello),
        ]
    )
    web.run_app(app, port=8765)#, ssl_context=ssl_context)

if __name__ == "__main__":
    print("Server started at wss://localhost:8765")
    run()