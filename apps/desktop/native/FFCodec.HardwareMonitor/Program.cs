using System.Text.Json;
using System.IO.Pipes;
using System.Security.Principal;
using System.Diagnostics;
using FFCodec.HardwareMonitor;

const int minimumIntervalMs = 500;
const int maximumIntervalMs = 10_000;
var jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);
using var cancellation = new CancellationTokenSource();
using var collector = new HardwareCollector();
var writeLock = new SemaphoreSlim(1, 1);
var captureLock = new SemaphoreSlim(1, 1);
var intervalMs = 1_000;
var running = false;
var elevated = IsElevated();

NamedPipeClientStream? pipe = null;
TextReader input = Console.In;
TextWriter output = Console.Out;
var pipeIndex = Array.FindIndex(args, value => value == "--pipe");
if (pipeIndex >= 0 && args.Length > pipeIndex + 1)
{
    pipe = new NamedPipeClientStream(".", args[pipeIndex + 1], PipeDirection.InOut, PipeOptions.Asynchronous);
    await pipe.ConnectAsync(30_000, cancellation.Token);
    input = new StreamReader(pipe);
    output = new StreamWriter(pipe) { AutoFlush = true };
}

async Task WriteAsync(MonitorMessage message)
{
    await writeLock.WaitAsync();
    try
    {
        await output.WriteLineAsync(JsonSerializer.Serialize(message, jsonOptions));
        await output.FlushAsync();
    }
    finally
    {
        writeLock.Release();
    }
}

async Task<HardwareSnapshot> CaptureAsync()
{
    await captureLock.WaitAsync(cancellation.Token);
    try
    {
        var stopwatch = Stopwatch.StartNew();
        var snapshot = collector.Capture(intervalMs);
        stopwatch.Stop();
        if (stopwatch.ElapsedMilliseconds <= 800) return snapshot;

        intervalMs = Math.Max(intervalMs, 2_000);
        var diagnostics = snapshot.Diagnostics.Append(new MonitorDiagnostic(
            "warning",
            "slow-sample",
            $"硬件采样耗时 {stopwatch.ElapsedMilliseconds} ms，采样间隔已退避至 {intervalMs} ms。"))
            .ToArray();
        return snapshot with { IntervalMs = intervalMs, Diagnostics = diagnostics };
    }
    finally
    {
        captureLock.Release();
    }
}

await WriteAsync(new("ready", Elevated: elevated));

var samplingTask = Task.Run(async () =>
{
    while (!cancellation.IsCancellationRequested)
    {
        if (running)
        {
            try
            {
                await WriteAsync(new("snapshot", Snapshot: await CaptureAsync()));
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
while ((line = await input.ReadLineAsync()) is not null)
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
                await WriteAsync(new("snapshot", Snapshot: await CaptureAsync()));
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
pipe?.Dispose();

static bool IsElevated()
{
    if (!OperatingSystem.IsWindows()) return false;
    using var identity = WindowsIdentity.GetCurrent();
    return new WindowsPrincipal(identity).IsInRole(WindowsBuiltInRole.Administrator);
}
