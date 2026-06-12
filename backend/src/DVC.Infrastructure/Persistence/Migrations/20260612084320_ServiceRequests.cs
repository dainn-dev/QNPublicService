using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DVC.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ServiceRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "service_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    public_service_id = table.Column<Guid>(type: "uuid", nullable: false),
                    citizen_id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_point_id = table.Column<Guid>(type: "uuid", nullable: true),
                    assigned_officer_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    note = table.Column<string>(type: "text", nullable: true),
                    submitted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    due_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_service_requests", x => x.id);
                    table.ForeignKey(
                        name: "fk_service_requests_public_services_public_service_id",
                        column: x => x.public_service_id,
                        principalTable: "public_services",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "service_request_documents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_request_id = table.Column<Guid>(type: "uuid", nullable: false),
                    url = table.Column<string>(type: "text", nullable: false),
                    document_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    file_name = table.Column<string>(type: "text", nullable: true),
                    is_supplement = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_service_request_documents", x => x.id);
                    table.ForeignKey(
                        name: "fk_service_request_documents_service_requests_service_request_",
                        column: x => x.service_request_id,
                        principalTable: "service_requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "service_request_status_history",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_request_id = table.Column<Guid>(type: "uuid", nullable: false),
                    from_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    to_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    changed_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    note = table.Column<string>(type: "text", nullable: true),
                    changed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_service_request_status_history", x => x.id);
                    table.ForeignKey(
                        name: "fk_service_request_status_history_service_requests_service_req",
                        column: x => x.service_request_id,
                        principalTable: "service_requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_service_request_documents_service_request_id",
                table: "service_request_documents",
                column: "service_request_id");

            migrationBuilder.CreateIndex(
                name: "ix_service_request_status_history_service_request_id",
                table: "service_request_status_history",
                column: "service_request_id");

            migrationBuilder.CreateIndex(
                name: "ix_service_requests_assigned_officer_id",
                table: "service_requests",
                column: "assigned_officer_id");

            migrationBuilder.CreateIndex(
                name: "ix_service_requests_citizen_id",
                table: "service_requests",
                column: "citizen_id");

            migrationBuilder.CreateIndex(
                name: "ix_service_requests_code",
                table: "service_requests",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_service_requests_public_service_id",
                table: "service_requests",
                column: "public_service_id");

            migrationBuilder.CreateIndex(
                name: "ix_service_requests_status",
                table: "service_requests",
                column: "status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "service_request_documents");

            migrationBuilder.DropTable(
                name: "service_request_status_history");

            migrationBuilder.DropTable(
                name: "service_requests");
        }
    }
}
