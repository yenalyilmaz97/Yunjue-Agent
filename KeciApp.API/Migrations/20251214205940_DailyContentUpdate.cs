using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KeciApp.API.Migrations
{
    /// <inheritdoc />
    public partial class DailyContentUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserProgress_UserId",
                table: "UserProgress");

            migrationBuilder.CreateIndex(
                name: "IX_UserProgress_UserId_ArticleId",
                table: "UserProgress",
                columns: new[] { "UserId", "ArticleId" },
                unique: true,
                filter: "\"ArticleId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserProgress_UserId_DailyContentId",
                table: "UserProgress",
                columns: new[] { "UserId", "DailyContentId" },
                unique: true,
                filter: "\"DailyContentId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserProgress_UserId_EpisodeId",
                table: "UserProgress",
                columns: new[] { "UserId", "EpisodeId" },
                unique: true,
                filter: "\"EpisodeId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserProgress_UserId_WeekId",
                table: "UserProgress",
                columns: new[] { "UserId", "WeekId" },
                unique: true,
                filter: "\"WeekId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserProgress_UserId_ArticleId",
                table: "UserProgress");

            migrationBuilder.DropIndex(
                name: "IX_UserProgress_UserId_DailyContentId",
                table: "UserProgress");

            migrationBuilder.DropIndex(
                name: "IX_UserProgress_UserId_EpisodeId",
                table: "UserProgress");

            migrationBuilder.DropIndex(
                name: "IX_UserProgress_UserId_WeekId",
                table: "UserProgress");

            migrationBuilder.CreateIndex(
                name: "IX_UserProgress_UserId",
                table: "UserProgress",
                column: "UserId");
        }
    }
}
