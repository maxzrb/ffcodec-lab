using LibreHardwareMonitor.Hardware;

namespace FFCodec.HardwareMonitor;

internal sealed class HardwareCollector : IDisposable
{
    private readonly Computer _computer = new()
    {
        IsCpuEnabled = true,
        IsGpuEnabled = true,
        IsMemoryEnabled = true,
        IsStorageEnabled = true,
    };
    private long _sequence;

    public HardwareCollector() => _computer.Open();

    public HardwareSnapshot Capture(int intervalMs)
    {
        var diagnostics = new List<MonitorDiagnostic>();
        var all = new List<IHardware>();
        foreach (var hardware in _computer.Hardware)
        {
            UpdateRecursive(hardware, all, diagnostics);
        }

        var cpus = all.Where(item => item.HardwareType == HardwareType.Cpu).Select(ToCpu).ToArray();
        var gpus = all.Where(item => item.HardwareType is HardwareType.GpuNvidia or HardwareType.GpuAmd or HardwareType.GpuIntel)
            .Select(ToGpu).ToArray();
        var memory = all.Where(item => item.HardwareType == HardwareType.Memory)
            .OrderBy(item => item.Name.Contains("Virtual", StringComparison.OrdinalIgnoreCase) ? 1 : 0)
            .Select(ToMemory).FirstOrDefault();
        var storage = all.Where(item => item.HardwareType == HardwareType.Storage).Select(ToStorage).ToArray();

        if (cpus.Length == 0) diagnostics.Add(new("warning", "cpu-unavailable", "未发现可读取的 CPU 传感器。"));
        if (gpus.Length == 0) diagnostics.Add(new("info", "gpu-unavailable", "未发现可读取的 GPU 传感器。"));
        if (memory is null) diagnostics.Add(new("warning", "memory-unavailable", "未发现可读取的内存传感器。"));

        return new(
            Interlocked.Increment(ref _sequence),
            DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            intervalMs,
            cpus,
            gpus,
            memory,
            storage,
            diagnostics);
    }

    private static void UpdateRecursive(IHardware hardware, List<IHardware> all, List<MonitorDiagnostic> diagnostics)
    {
        try
        {
            hardware.Update();
            all.Add(hardware);
            foreach (var child in hardware.SubHardware) UpdateRecursive(child, all, diagnostics);
        }
        catch (Exception exception)
        {
            diagnostics.Add(new("warning", "hardware-update-failed", $"{hardware.Name}: {exception.Message}"));
        }
    }

    private static CpuSnapshot ToCpu(IHardware hardware)
    {
        var sensors = hardware.Sensors;
        var cores = sensors
            .Where(sensor => sensor.SensorType == SensorType.Load
                && sensor.Name.StartsWith("CPU Core", StringComparison.OrdinalIgnoreCase)
                && !sensor.Name.Contains("Max", StringComparison.OrdinalIgnoreCase)
                && !sensor.Name.Contains("Average", StringComparison.OrdinalIgnoreCase))
            .Select(sensor => new CoreSnapshot(
                sensor.Identifier.ToString(),
                sensor.Name,
                Value(sensor),
                FindMatchingCoreClock(sensors, sensor.Name)))
            .ToArray();

        return new(
            hardware.Identifier.ToString(), hardware.Name,
            Find(sensors, SensorType.Load, "CPU Total", "Total"),
            AverageOrPackage(sensors, SensorType.Temperature, "CPU Package", "Core Average", "Tctl/Tdie"),
            Sum(sensors, SensorType.Power, "CPU Package", "Package"),
            Average(sensors, SensorType.Clock, "Core"), cores);
    }

    private static GpuSnapshot ToGpu(IHardware hardware)
    {
        var sensors = hardware.Sensors;
        var memoryUsed = Find(sensors, SensorType.SmallData, "GPU Memory Used", "Memory Used");
        var memoryTotal = Find(sensors, SensorType.SmallData, "GPU Memory Total", "Memory Total");
        return new(
            hardware.Identifier.ToString(), hardware.Name, hardware.HardwareType.ToString(),
            Find(sensors, SensorType.Load, "GPU Core", "D3D 3D", "Core"),
            Find(sensors, SensorType.Load, "GPU Memory", "Memory"),
            ToGigabytes(memoryUsed), ToGigabytes(memoryTotal),
            Find(sensors, SensorType.Temperature, "GPU Core", "Core", "Hot Spot"),
            Find(sensors, SensorType.Power, "GPU Package", "GPU Power", "Total"),
            Find(sensors, SensorType.Clock, "GPU Core", "Core"),
            Find(sensors, SensorType.Clock, "GPU Memory", "Memory"),
            Find(sensors, SensorType.Fan, "GPU", "Fan"));
    }

    private static MemorySnapshot ToMemory(IHardware hardware)
    {
        var sensors = hardware.Sensors;
        var used = Find(sensors, SensorType.Data, "Memory Used", "Used Memory");
        var available = Find(sensors, SensorType.Data, "Memory Available", "Available Memory");
        return new(
            hardware.Identifier.ToString(), hardware.Name,
            Find(sensors, SensorType.Load, "Memory", "Load"),
            used, available,
            used is not null && available is not null ? used + available : null);
    }

    private static StorageSnapshot ToStorage(IHardware hardware)
    {
        var sensors = hardware.Sensors;
        return new(
            hardware.Identifier.ToString(), hardware.Name,
            Find(sensors, SensorType.Load, "Used Space", "Space"),
            Find(sensors, SensorType.Load, "Read Activity", "Read"),
            Find(sensors, SensorType.Load, "Write Activity", "Write"),
            ToMegabytes(Find(sensors, SensorType.Throughput, "Read Rate", "Read")),
            ToMegabytes(Find(sensors, SensorType.Throughput, "Write Rate", "Write")),
            Find(sensors, SensorType.Temperature, "Temperature", "Composite"));
    }

    private static float? FindMatchingCoreClock(IEnumerable<ISensor> sensors, string loadName)
    {
        var suffix = loadName.Replace("CPU Core", "", StringComparison.OrdinalIgnoreCase).Trim();
        return Find(sensors, SensorType.Clock, $"CPU Core {suffix}", $"Core {suffix}");
    }

    private static float? Find(IEnumerable<ISensor> sensors, SensorType type, params string[] names) =>
        sensors.Where(sensor => sensor.SensorType == type)
            .OrderBy(sensor => Array.FindIndex(names, name => sensor.Name.Equals(name, StringComparison.OrdinalIgnoreCase)))
            .FirstOrDefault(sensor => names.Any(name => sensor.Name.Contains(name, StringComparison.OrdinalIgnoreCase))) is { } found
                ? Value(found)
                : null;

    private static float? AverageOrPackage(IEnumerable<ISensor> sensors, SensorType type, params string[] names) =>
        Find(sensors, type, names) ?? Average(sensors, type, "Core");

    private static float? Average(IEnumerable<ISensor> sensors, SensorType type, string namePart)
    {
        var values = sensors.Where(sensor => sensor.SensorType == type && sensor.Name.Contains(namePart, StringComparison.OrdinalIgnoreCase))
            .Select(Value).Where(value => value.HasValue).Select(value => value!.Value).ToArray();
        return values.Length == 0 ? null : values.Average();
    }

    private static float? Sum(IEnumerable<ISensor> sensors, SensorType type, params string[] names) => Find(sensors, type, names);
    private static float? Value(ISensor sensor) => sensor.Value is { } value && float.IsFinite(value) ? value : null;
    private static float? ToGigabytes(float? megabytes) => megabytes is null ? null : megabytes / 1024f;
    private static float? ToMegabytes(float? bytesPerSecond) => bytesPerSecond is null ? null : bytesPerSecond / 1024f / 1024f;

    public void Dispose() => _computer.Close();
}
