using System.Text.Json;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace KeciApp.API.Services;

public class ContentUpdateBatchService : IContentUpdateBatchService
{
    private readonly IContentUpdateBatchRepository _repository;

    public ContentUpdateBatchService(IContentUpdateBatchRepository repository)
    {
        _repository = repository;
        // License key configuration for QuestPDF (Community License)
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task LogBatchAsync(string updateType, List<UserUpdateDetail> updates, string? description = null)
    {
        if (updates == null || !updates.Any())
            return;

        var jsonOptions = new JsonSerializerOptions { WriteIndented = false };
        var json = JsonSerializer.Serialize(updates, jsonOptions);

        var batch = new ContentUpdateBatch
        {
            BatchId = Guid.NewGuid(),
            UpdateType = updateType,
            CreatedAt = DateTime.UtcNow,
            UpdateData = json,
            Description = description ?? $"{updateType} for {updates.Count} users."
        };

        await _repository.CreateBatchAsync(batch);
    }

    public async Task<IEnumerable<ContentUpdateBatch>> GetRecentBatchesAsync(int count = 10)
    {
        return await _repository.GetRecentBatchesAsync(count);
    }

    public async Task<byte[]> GeneratePdfForBatchAsync(Guid batchId)
    {
        var batch = await _repository.GetBatchByIdAsync(batchId);
        if (batch == null)
            throw new FileNotFoundException("Batch not found");

        var updates = JsonSerializer.Deserialize<List<UserUpdateDetail>>(batch.UpdateData);
        if (updates == null) updates = new List<UserUpdateDetail>();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header()
                    .Text($"Content Update Report: {batch.UpdateType}")
                    .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

                page.Content()
                    .PaddingVertical(1, Unit.Centimetre)
                    .Column(x =>
                    {
                        x.Item().Text($"Date: {batch.CreatedAt:yyyy-MM-dd HH:mm:ss} UTC");
                        x.Item().Text($"Batch ID: {batch.BatchId}");
                        x.Item().Text($"Description: {batch.Description}");
                        x.Item().PaddingBottom(10);

                        x.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(50);
                                columns.RelativeColumn(3);
                                columns.RelativeColumn(5);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(CellStyle).Text("ID");
                                header.Cell().Element(CellStyle).Text("User Name");
                                header.Cell().Element(CellStyle).Text("Update Details");

                                static IContainer CellStyle(IContainer container)
                                {
                                    return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                                }
                            });

                            foreach (var update in updates)
                            {
                                table.Cell().Element(CellStyle).Text(update.UserId.ToString());
                                table.Cell().Element(CellStyle).Text(update.UserName);
                                table.Cell().Element(CellStyle).Text(update.Details);

                                static IContainer CellStyle(IContainer container)
                                {
                                    return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5);
                                }
                            }
                        });
                    });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                    });
            });
        });

        return document.GeneratePdf();
    }
}
