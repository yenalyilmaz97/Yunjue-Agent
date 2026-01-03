using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KeciApp.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserSeriesAccessConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserSeriesAccesses_UserId_SeriesId",
                table: "UserSeriesAccesses");

            migrationBuilder.AlterColumn<int>(
                name: "SeriesId",
                table: "UserSeriesAccesses",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateIndex(
                name: "IX_UserSeriesAccesses_UserId_SeriesId_ArticleId",
                table: "UserSeriesAccesses",
                columns: new[] { "UserId", "SeriesId", "ArticleId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserSeriesAccesses_UserId_SeriesId_ArticleId",
                table: "UserSeriesAccesses");

            migrationBuilder.AlterColumn<int>(
                name: "SeriesId",
                table: "UserSeriesAccesses",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSeriesAccesses_UserId_SeriesId",
                table: "UserSeriesAccesses",
                columns: new[] { "UserId", "SeriesId" },
                unique: true);
        }
    }
}
