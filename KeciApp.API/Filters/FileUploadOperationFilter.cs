using Microsoft.AspNetCore.Http;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Linq;
using Microsoft.OpenApi.Any;

namespace KeciApp.API.Filters;

public class FileUploadOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var fileParameters = context.ApiDescription.ParameterDescriptions
            .Where(p => p.Source == Microsoft.AspNetCore.Mvc.ModelBinding.BindingSource.Form &&
                       (p.ModelMetadata?.ModelType == typeof(IFormFile) ||
                        p.ModelMetadata?.ModelType == typeof(IFormFile[])))
            .ToList();

        if (!fileParameters.Any())
            return;

        // Remove existing parameters that are IFormFile from form
        if (operation.Parameters != null)
        {
            foreach (var fileParam in fileParameters)
            {
                var param = operation.Parameters.FirstOrDefault(p => p.Name == fileParam.Name);
                if (param != null)
                {
                    operation.Parameters.Remove(param);
                }
            }
        }

        // Build properties dictionary for all file parameters
        var properties = new Dictionary<string, OpenApiSchema>();
        var required = new HashSet<string>();

        foreach (var fileParam in fileParameters)
        {
            var paramName = fileParam.Name;
            properties[paramName] = new OpenApiSchema
            {
                Type = "string",
                Format = "binary",
                Description = "File to upload"
            };
            required.Add(paramName);
        }

        // Add file upload support
        operation.RequestBody = new OpenApiRequestBody
        {
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties = properties,
                        Required = required
                    }
                }
            }
        };
    }
}

public class FileUploadParameterFilter : IParameterFilter
{
    public void Apply(OpenApiParameter parameter, ParameterFilterContext context)
    {
        if (context.ApiParameterDescription?.ModelMetadata?.ModelType == typeof(IFormFile) ||
            context.ApiParameterDescription?.ModelMetadata?.ModelType == typeof(IFormFile[]))
        {
            // Set schema to binary format for IFormFile parameters
            parameter.Schema = new OpenApiSchema
            {
                Type = "string",
                Format = "binary"
            };
            parameter.In = ParameterLocation.Query; // This will be overridden by OperationFilter
        }
    }
}

public class FileUploadSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type == typeof(IFormFile) || context.Type == typeof(IFormFile[]))
        {
            schema.Type = "string";
            schema.Format = "binary";
        }
    }
}

public class FileUploadDocumentFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        // This filter runs after all operations are generated
        // It can be used to modify the document if needed
        // For now, we rely on OperationFilter and SchemaFilter
    }
}

