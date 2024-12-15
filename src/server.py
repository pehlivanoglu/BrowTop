import asyncio
from datetime import datetime
import json
import pathlib
import ssl

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
    cert_file = pathlib.Path(__file__).parents[1].joinpath("cert/localhost.crt")
    key_file = pathlib.Path(__file__).parents[1].joinpath("cert/localhost.key")
    ssl_context.load_cert_chain(cert_file, key_file)
    return ssl_context


def run():
    """Start WebSocket server."""
    ssl_context = create_ssl_context()
    app = web.Application()
    app.add_routes(
        [
            web.get("/ws", send_stats),
            web.get("/monitor", monitor),
            web.get("/hello", hello),
        ]
    )
    web.run_app(app, port=8765, ssl_context=ssl_context)


async def main():
    print(await list_of_processes())
    # print("Server started at wss://localhost:8765")
    # run()

if __name__ == "__main__":
    asyncio.run(main())