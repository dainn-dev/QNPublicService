using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DVC.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CatalogAndServicePoints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "service_categories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    parent_id = table.Column<Guid>(type: "uuid", nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_service_categories", x => x.id);
                    table.ForeignKey(
                        name: "fk_service_categories_service_categories_parent_id",
                        column: x => x.parent_id,
                        principalTable: "service_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "service_points",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    address = table.Column<string>(type: "text", nullable: false),
                    province_code = table.Column<int>(type: "integer", nullable: true),
                    ward_code = table.Column<int>(type: "integer", nullable: true),
                    latitude = table.Column<decimal>(type: "numeric(10,7)", nullable: true),
                    longitude = table.Column<decimal>(type: "numeric(10,7)", nullable: true),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    website = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    working_hours = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_service_points", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "public_services",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    category_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    required_documents = table.Column<string>(type: "text", nullable: true),
                    processing_time_days = table.Column<int>(type: "integer", nullable: true),
                    fee = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    service_level = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_public_services", x => x.id);
                    table.ForeignKey(
                        name: "fk_public_services_service_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "service_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "service_point_images",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_point_id = table.Column<Guid>(type: "uuid", nullable: false),
                    url = table.Column<string>(type: "text", nullable: false),
                    caption = table.Column<string>(type: "text", nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_service_point_images", x => x.id);
                    table.ForeignKey(
                        name: "fk_service_point_images_service_points_service_point_id",
                        column: x => x.service_point_id,
                        principalTable: "service_points",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "service_point_services",
                columns: table => new
                {
                    service_point_id = table.Column<Guid>(type: "uuid", nullable: false),
                    public_service_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_service_point_services", x => new { x.service_point_id, x.public_service_id });
                    table.ForeignKey(
                        name: "fk_service_point_services_public_services_public_service_id",
                        column: x => x.public_service_id,
                        principalTable: "public_services",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_service_point_services_service_points_service_point_id",
                        column: x => x.service_point_id,
                        principalTable: "service_points",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_public_services_category_id",
                table: "public_services",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_public_services_code",
                table: "public_services",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_service_categories_code",
                table: "service_categories",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_service_categories_parent_id",
                table: "service_categories",
                column: "parent_id");

            migrationBuilder.CreateIndex(
                name: "ix_service_point_images_service_point_id",
                table: "service_point_images",
                column: "service_point_id");

            migrationBuilder.CreateIndex(
                name: "ix_service_point_services_public_service_id",
                table: "service_point_services",
                column: "public_service_id");

            migrationBuilder.CreateIndex(
                name: "ix_service_points_code",
                table: "service_points",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_service_points_latitude_longitude",
                table: "service_points",
                columns: new[] { "latitude", "longitude" });

            migrationBuilder.CreateIndex(
                name: "ix_service_points_province_code_ward_code",
                table: "service_points",
                columns: new[] { "province_code", "ward_code" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "service_point_images");

            migrationBuilder.DropTable(
                name: "service_point_services");

            migrationBuilder.DropTable(
                name: "public_services");

            migrationBuilder.DropTable(
                name: "service_points");

            migrationBuilder.DropTable(
                name: "service_categories");
        }
    }
}
