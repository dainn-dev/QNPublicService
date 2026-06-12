using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DVC.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Ratings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "service_point_ratings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_point_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    score = table.Column<int>(type: "integer", nullable: false),
                    comment = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_service_point_ratings", x => x.id);
                    table.CheckConstraint("ck_service_point_ratings_score", "score BETWEEN 1 AND 5");
                });

            migrationBuilder.CreateTable(
                name: "service_request_ratings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_request_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    score = table.Column<int>(type: "integer", nullable: false),
                    comment = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_service_request_ratings", x => x.id);
                    table.CheckConstraint("ck_service_request_ratings_score", "score BETWEEN 1 AND 5");
                });

            migrationBuilder.CreateIndex(
                name: "ix_service_point_ratings_service_point_id_user_id",
                table: "service_point_ratings",
                columns: new[] { "service_point_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_service_request_ratings_service_request_id",
                table: "service_request_ratings",
                column: "service_request_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "service_point_ratings");

            migrationBuilder.DropTable(
                name: "service_request_ratings");
        }
    }
}
