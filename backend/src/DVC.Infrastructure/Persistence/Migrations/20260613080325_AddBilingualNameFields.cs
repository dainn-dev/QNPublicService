using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DVC.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBilingualNameFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "name_en",
                table: "service_points",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "description_en",
                table: "service_categories",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "name_en",
                table: "service_categories",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "description_en",
                table: "public_services",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "name_en",
                table: "public_services",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "name_en",
                table: "service_points");

            migrationBuilder.DropColumn(
                name: "description_en",
                table: "service_categories");

            migrationBuilder.DropColumn(
                name: "name_en",
                table: "service_categories");

            migrationBuilder.DropColumn(
                name: "description_en",
                table: "public_services");

            migrationBuilder.DropColumn(
                name: "name_en",
                table: "public_services");
        }
    }
}
