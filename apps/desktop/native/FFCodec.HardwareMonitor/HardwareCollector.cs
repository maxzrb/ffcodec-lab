using LibreHardwareMonitor.Hardware;
using System.Management;

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
    private readonly WindowsCpuFallback _cpuFallback = new();

    public HardwareCollector() => _computer.Open();

    public HardwareSnapshot Capture(int intervalMs)
    {
        var diagnostics = new List<MonitorDiagnostic>();
        var all = new List<IHardware>();
        foreach (var hardware in _computer.Hardware)
        {
            UpdateRecursive(hardware, all, diagnostics);
        }

        var frequencyFallback = _cpuFallback.Read();
        var cpus = all.Where(item => item.HardwareType == HardwareType.Cpu)
            .Select(item => ToCpu(item, frequencyFallback)).ToArray();
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

    public IReadOnlyList<SensorDiagnostic> DumpSensors()
    {
        var diagnostics = new List<MonitorDiagnostic>();
        var all = new List<IHardware>();
        foreach (var hardware in _computer.Hardware)
        {
            UpdateRecursive(hardware, all, diagnostics);
        }

        return all.SelectMany(hardware => hardware.Sensors.Select(sensor => new SensorDiagnostic(
            hardware.Name,
            hardware.HardwareType.ToString(),
            sensor.Name,
            sensor.SensorType.ToString(),
            sensor.Identifier.ToString(),
            Value(sensor))))
            .ToArray();
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

    private static CpuSnapshot ToCpu(IHardware hardware, CpuFrequencyFallback frequencyFallback)
    {
        var sensors = hardware.Sensors;
        var cores = sensors
            .Where(sensor => sensor.SensorType == SensorType.Load
                && sensor.Name.StartsWith("CPU Core", StringComparison.OrdinalIgnoreCase)
                && !sensor.Name.Contains("Max", StringComparison.OrdinalIgnoreCase)
                && !sensor.Name.Contains("Average", StringComparison.OrdinalIgnoreCase))
            .Select((sensor, index) => new CoreSnapshot(
                sensor.Identifier.ToString(),
                sensor.Name,
                Value(sensor),
                FindMatchingCoreClock(sensors, sensor.Name) ?? frequencyFallback.Logical.ElementAtOrDefault(index)))
            .ToArray();

        return new(
            hardware.Identifier.ToString(), hardware.Name,
            Find(sensors, SensorType.Load, "CPU Total", "Total"),
            AverageOrPackage(sensors, SensorType.Temperature, "CPU Package", "Core Average", "Tctl/Tdie"),
            Positive(Find(sensors, SensorType.Power, "CPU Package", "Package")),
            Average(sensors, SensorType.Clock, "Core") ?? frequencyFallback.Total, cores);
    }

    private static GpuSnapshot ToGpu(IHardware hardware)
    {
        var sensors = hardware.Sensors;
        var memoryUsed = Find(sensors, SensorType.SmallData, "GPU Memory Used", "Memory Used");
        var memoryTotal = Find(sensors, SensorType.SmallData, "GPU Memory Total", "Memory Total");
        var memoryLoad = memoryUsed is > 0 && memoryTotal is > 0
            ? Math.Clamp(memoryUsed.Value / memoryTotal.Value * 100, 0, 100)
            : Find(sensors, SensorType.Load, "GPU Memory", "Memory");
        return new(
            hardware.Identifier.ToString(), hardware.Name, hardware.HardwareType.ToString(),
            Find(sensors, SensorType.Load, "GPU Core", "D3D 3D", "Core"),
            MaximumMatching(sensors, SensorType.Load, "D3D 3D", "High Priority 3D"),
            MaximumMatching(sensors, SensorType.Load, "D3D Copy"),
            MaximumMatching(sensors, SensorType.Load, "Video Decode"),
            MaximumMatching(sensors, SensorType.Load, "Video Encode", "Video Codec"),
            memoryLoad,
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
            hardware.Identifier.ToString(), CleanHardwareName(hardware.Name),
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

    private static float? Find(IEnumerable<ISensor> sensors, SensorType type, params string[] names)
    {
        var typed = sensors.Where(sensor => sensor.SensorType == type).ToArray();
        foreach (var name in names)
        {
            var exact = typed.FirstOrDefault(sensor => sensor.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
            if (exact is not null && Value(exact) is { } value) return value;
        }
        foreach (var name in names)
        {
            var partial = typed.FirstOrDefault(sensor => sensor.Name.Contains(name, StringComparison.OrdinalIgnoreCase)
                && Value(sensor).HasValue);
            if (partial is not null) return Value(partial);
        }
        return null;
    }

    private static float? AverageOrPackage(IEnumerable<ISensor> sensors, SensorType type, params string[] names) =>
        Find(sensors, type, names) ?? Average(sensors, type, "Core");

    private static float? Average(IEnumerable<ISensor> sensors, SensorType type, string namePart)
    {
        var values = sensors.Where(sensor => sensor.SensorType == type && sensor.Name.Contains(namePart, StringComparison.OrdinalIgnoreCase))
            .Select(Value).Where(value => value.HasValue).Select(value => value!.Value).ToArray();
        return values.Length == 0 ? null : values.Average();
    }

    private static float? MaximumMatching(IEnumerable<ISensor> sensors, SensorType type, params string[] nameParts)
    {
        var values = sensors.Where(sensor => sensor.SensorType == type
                && nameParts.Any(part => sensor.Name.Contains(part, StringComparison.OrdinalIgnoreCase)))
            .Select(Value)
            .Where(value => value.HasValue)
            .Select(value => value!.Value)
            .ToArray();
        return values.Length == 0 ? null : values.Max();
    }

    private static float? Positive(float? value) => value is > 0 ? value : null;
    private static string CleanHardwareName(string name)
    {
        var cleaned = name.Trim().TrimEnd('\\', '/').Trim();
        return cleaned.Length > 0 ? cleaned : name.Trim();
    }
    private static float? Value(ISensor sensor) => sensor.Value is { } value && float.IsFinite(value) ? value : null;
    private static float? ToGigabytes(float? megabytes) => megabytes is null ? null : megabytes / 1024f;
    private static float? ToMegabytes(float? bytesPerSecond) => bytesPerSecond is null ? null : bytesPerSecond / 1024f / 1024f;

    public void Dispose() => _computer.Close();
}

internal sealed class WindowsCpuFallback
{
    private CpuFrequencyFallback _snapshot = new(null, []);
    private long _lastReadAt;

    public CpuFrequencyFallback Read()
    {
        if (!OperatingSystem.IsWindows()) return _snapshot;
        var now = Environment.TickCount64;
        if (now - _lastReadAt < 900) return _snapshot;
        _lastReadAt = now;
        try
        {
            using var searcher = new ManagementObjectSearcher(
                "root\\CIMV2",
                "SELECT Name, ProcessorFrequency, PercentProcessorPerformance FROM Win32_PerfFormattedData_Counters_ProcessorInformation");
            var logical = new SortedDictionary<int, float?>();
            float? total = null;
            foreach (ManagementObject item in searcher.Get())
            {
                var name = Convert.ToString(item["Name"]);
                var frequency = PositiveFinite(item["ProcessorFrequency"]);
                var performance = PositiveFinite(item["PercentProcessorPerformance"]);
                var effective = frequency is { } mhz && performance is { } percent ? mhz * percent / 100f : frequency;
                if (name is "_Total" or "0,_Total") total = effective;
                else if (name?.Split(',') is [_, var logicalIndex] && int.TryParse(logicalIndex, out var index))
                    logical[index] = effective;
            }
            _snapshot = new(total, logical.OrderBy(item => item.Key).Select(item => item.Value).ToArray());
        }
        catch
        {
            _snapshot = new(null, []);
        }
        return _snapshot;
    }

    private static float? PositiveFinite(object? value)
    {
        if (value is null) return null;
        var parsed = Convert.ToSingle(value);
        return float.IsFinite(parsed) && parsed > 0 ? parsed : null;
    }
}

internal sealed record CpuFrequencyFallback(float? Total, IReadOnlyList<float?> Logical);
