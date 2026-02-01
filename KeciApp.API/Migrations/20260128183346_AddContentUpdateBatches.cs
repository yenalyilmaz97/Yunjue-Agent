using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KeciApp.API.Migrations
{
    /// <inheritdoc />
    public partial class AddContentUpdateBatches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MovieDescription",
                table: "Movies",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ContentUpdateBatches",
                columns: table => new
                {
                    BatchId = table.Column<Guid>(type: "uuid", nullable: false),
                    UpdateType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdateData = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContentUpdateBatches", x => x.BatchId);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContentUpdateBatches");

            migrationBuilder.DropColumn(
                name: "MovieDescription",
                table: "Movies");
        }
    }
}
