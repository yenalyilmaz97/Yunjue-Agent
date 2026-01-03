using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KeciApp.API.Migrations
{
    /// <inheritdoc />
    public partial class DailyContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DailyContentId",
                table: "Users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DailyContentId",
                table: "UserProgress",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_DailyContentId",
                table: "Users",
                column: "DailyContentId");

            migrationBuilder.CreateIndex(
                name: "IX_UserProgress_DailyContentId",
                table: "UserProgress",
                column: "DailyContentId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserProgress_DailyContent_DailyContentId",
                table: "UserProgress",
                column: "DailyContentId",
                principalTable: "DailyContent",
                principalColumn: "DailyContentId",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_DailyContent_DailyContentId",
                table: "Users",
                column: "DailyContentId",
                principalTable: "DailyContent",
                principalColumn: "DailyContentId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserProgress_DailyContent_DailyContentId",
                table: "UserProgress");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_DailyContent_DailyContentId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_DailyContentId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_UserProgress_DailyContentId",
                table: "UserProgress");

            migrationBuilder.DropColumn(
                name: "DailyContentId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DailyContentId",
                table: "UserProgress");
        }
    }
}
