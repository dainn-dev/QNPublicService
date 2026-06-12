using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DVC.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class OfficerProfiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "officer_profiles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    department = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    position = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    service_point_id = table.Column<Guid>(type: "uuid", nullable: true),
                    phone_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_officer_profiles", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_officer_profiles_service_point_id",
                table: "officer_profiles",
                column: "service_point_id");

            migrationBuilder.CreateIndex(
                name: "ix_officer_profiles_user_id",
                table: "officer_profiles",
                column: "user_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "officer_profiles");
        }
    }
}
