using System.Text.Json.Serialization;

namespace FFCodec.HardwareMonitor;

internal sealed record MonitorMessage(
    string Type,
    int ProtocolVersion = 1,
    string? Message = null,
    HardwareSnapshot? Snapshot = null,
    int? IntervalMs = null,
    bool? Elevated = null);

internal sealed record HardwareSnapshot(
    long Sequence,
    long SampledAt,
    int IntervalMs,
    IReadOnlyList<CpuSnapshot> Cpu,
    IReadOnlyList<GpuSnapshot> Gpu,
    MemorySnapshot? Memory,
    IReadOnlyList<StorageSnapshot> Storage,
    IReadOnlyList<MonitorDiagnostic> Diagnostics);

internal sealed record CpuSnapshot(
    string Id,
    string Name,
    float? Load,
    float? TemperatureC,
    float? PowerW,
    float? ClockMhz,
    IReadOnlyList<CoreSnapshot> Cores);

internal sealed record CoreSnapshot(string Id, string Name, float? Load, float? ClockMhz);

internal sealed record GpuSnapshot(
    string Id,
    string Name,
    string Kind,
    float? Load,
    float? ThreeDLoad,
    float? CopyLoad,
    float? VideoDecodeLoad,
    float? VideoEncodeLoad,
    float? MemoryLoad,
    float? MemoryUsedGb,
    float? MemoryTotalGb,
    float? TemperatureC,
    float? PowerW,
    float? CoreClockMhz,
    float? MemoryClockMhz,
    float? FanRpm);

internal sealed record MemorySnapshot(
    string Id,
    string Name,
    float? Load,
    float? UsedGb,
    float? AvailableGb,
    float? TotalGb);

internal sealed record StorageSnapshot(
    string Id,
    string Name,
    float? SpaceLoad,
    float? ReadLoad,
    float? WriteLoad,
    float? ReadRateMb,
    float? WriteRateMb,
    float? TemperatureC);

internal sealed record MonitorDiagnostic(string Level, string Code, string Message);

internal sealed record SensorDiagnostic(
    string Hardware,
    string HardwareType,
    string Name,
    string SensorType,
    string Identifier,
    float? Value);

internal sealed class MonitorCommand
{
    [JsonPropertyName("type")]
    public string? Type { get; init; }

    [JsonPropertyName("intervalMs")]
    public int? IntervalMs { get; init; }
}
