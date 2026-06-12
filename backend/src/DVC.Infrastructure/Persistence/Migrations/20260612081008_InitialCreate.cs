using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DVC.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "provinces",
                columns: table => new
                {
                    code = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    code_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    division_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    phone_code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_provinces", x => x.code);
                });

            migrationBuilder.CreateTable(
                name: "wards",
                columns: table => new
                {
                    code = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    code_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    division_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    province_code = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_wards", x => x.code);
                    table.ForeignKey(
                        name: "fk_wards_provinces_province_code",
                        column: x => x.province_code,
                        principalTable: "provinces",
                        principalColumn: "code",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_wards_province_code",
                table: "wards",
                column: "province_code");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "wards");

            migrationBuilder.DropTable(
                name: "provinces");
        }
    }
}
