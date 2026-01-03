using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KeciApp.API.Migrations
{
    /// <inheritdoc />
    public partial class CascadeDeleteCreated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Favorites_PodcastEpisodes_EpisodeId",
                table: "Favorites");

            migrationBuilder.DropForeignKey(
                name: "FK_Notes_PodcastEpisodes_EpisodeId",
                table: "Notes");

            migrationBuilder.DropForeignKey(
                name: "FK_Questions_PodcastEpisodes_EpisodeId",
                table: "Questions");

            migrationBuilder.DropForeignKey(
                name: "FK_UserProgress_PodcastEpisodes_EpisodeId",
                table: "UserProgress");

            migrationBuilder.AddForeignKey(
                name: "FK_Favorites_PodcastEpisodes_EpisodeId",
                table: "Favorites",
                column: "EpisodeId",
                principalTable: "PodcastEpisodes",
                principalColumn: "EpisodesId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_PodcastEpisodes_EpisodeId",
                table: "Notes",
                column: "EpisodeId",
                principalTable: "PodcastEpisodes",
                principalColumn: "EpisodesId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_PodcastEpisodes_EpisodeId",
                table: "Questions",
                column: "EpisodeId",
                principalTable: "PodcastEpisodes",
                principalColumn: "EpisodesId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserProgress_PodcastEpisodes_EpisodeId",
                table: "UserProgress",
                column: "EpisodeId",
                principalTable: "PodcastEpisodes",
                principalColumn: "EpisodesId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Favorites_PodcastEpisodes_EpisodeId",
                table: "Favorites");

            migrationBuilder.DropForeignKey(
                name: "FK_Notes_PodcastEpisodes_EpisodeId",
                table: "Notes");

            migrationBuilder.DropForeignKey(
                name: "FK_Questions_PodcastEpisodes_EpisodeId",
                table: "Questions");

            migrationBuilder.DropForeignKey(
                name: "FK_UserProgress_PodcastEpisodes_EpisodeId",
                table: "UserProgress");

            migrationBuilder.AddForeignKey(
                name: "FK_Favorites_PodcastEpisodes_EpisodeId",
                table: "Favorites",
                column: "EpisodeId",
                principalTable: "PodcastEpisodes",
                principalColumn: "EpisodesId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_PodcastEpisodes_EpisodeId",
                table: "Notes",
                column: "EpisodeId",
                principalTable: "PodcastEpisodes",
                principalColumn: "EpisodesId");

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_PodcastEpisodes_EpisodeId",
                table: "Questions",
                column: "EpisodeId",
                principalTable: "PodcastEpisodes",
                principalColumn: "EpisodesId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserProgress_PodcastEpisodes_EpisodeId",
                table: "UserProgress",
                column: "EpisodeId",
                principalTable: "PodcastEpisodes",
                principalColumn: "EpisodesId");
        }
    }
}
