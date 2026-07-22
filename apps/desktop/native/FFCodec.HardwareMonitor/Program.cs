using System.Text.Json;
using FFCodec.HardwareMonitor;

const int minimumIntervalMs = 500;
const int maximumIntervalMs = 10_000;
var jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);
using var cancellation = new CancellationTokenSource();
using var collector = new HardwareCollector();
var writeLock = new SemaphoreSlim(1, 1);
var intervalMs = 1_000;
var running = false;

async Task WriteAsync(MonitorMessage message)
{
    await writeLock.WaitAsync();
    try
    {
        await Console.Out.WriteLineAsync(JsonSerializer.Serialize(message, jsonOptions));
        await Console.Out.FlushAsync();
    }
    finally
    {
        writeLock.Release();
    }
}

await WriteAsync(new("ready"));

var samplingTask = Task.Run(async () =>
{
    while (!cancellation.IsCancellationRequested)
    {
        if (running)
        {
            try
            {
                await WriteAsync(new("snapshot", Snapshot: collector.Capture(intervalMs)));
            }
            catch (Exception exception)
            {
                Console.Error.WriteLine($"采样失败: {exception}");
                await WriteAsync(new("error", Message: exception.Message));
            }
        }

        try
        {
            await Task.Delay(running ? intervalMs : 100, cancellation.Token);
        }
        catch (OperationCanceledException)
        {
            break;
        }
    }
});

string? line;
while ((line = await Console.In.ReadLineAsync()) is not null)
{
    try
    {
        var command = JsonSerializer.Deserialize<MonitorCommand>(line, jsonOptions);
        switch (command?.Type)
        {
            case "start":
                if (command.IntervalMs is { } startInterval)
                    intervalMs = Math.Clamp(startInterval, minimumIntervalMs, maximumIntervalMs);
                running = true;
                await WriteAsync(new("state", Message: "running", IntervalMs: intervalMs));
                break;
            case "set-interval":
                intervalMs = Math.Clamp(command.IntervalMs ?? intervalMs, minimumIntervalMs, maximumIntervalMs);
                await WriteAsync(new("state", Message: running ? "running" : "idle", IntervalMs: intervalMs));
                break;
            case "snapshot":
                await WriteAsync(new("snapshot", Snapshot: collector.Capture(intervalMs)));
                break;
            case "ping":
                await WriteAsync(new("pong"));
                break;
            case "stop":
                cancellation.Cancel();
                await WriteAsync(new("state", Message: "stopped", IntervalMs: intervalMs));
                await samplingTask;
                return;
            default:
                await WriteAsync(new("error", Message: "未知命令。"));
                break;
        }
    }
    catch (JsonException exception)
    {
        await WriteAsync(new("error", Message: $"无效 JSON: {exception.Message}"));
    }
}

cancellation.Cancel();
await samplingTask;
