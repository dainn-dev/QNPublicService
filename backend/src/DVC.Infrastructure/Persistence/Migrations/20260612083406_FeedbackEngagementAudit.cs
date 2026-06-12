using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DVC.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FeedbackEngagementAudit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    actor_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: true),
                    old_value = table.Column<string>(type: "jsonb", nullable: true),
                    new_value = table.Column<string>(type: "jsonb", nullable: true),
                    ip_address = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_audit_logs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "feedback_categories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_feedback_categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    message = table.Column<string>(type: "text", nullable: false),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    read_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    related_entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    related_entity_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notifications", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "feedback_reports",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    category_id = table.Column<Guid>(type: "uuid", nullable: false),
                    citizen_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    address = table.Column<string>(type: "text", nullable: true),
                    latitude = table.Column<decimal>(type: "numeric(10,7)", nullable: true),
                    longitude = table.Column<decimal>(type: "numeric(10,7)", nullable: true),
                    province_code = table.Column<int>(type: "integer", nullable: true),
                    ward_code = table.Column<int>(type: "integer", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    priority = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    assigned_officer_id = table.Column<Guid>(type: "uuid", nullable: true),
                    submitted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    due_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    resolved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    closed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_feedback_reports", x => x.id);
                    table.ForeignKey(
                        name: "fk_feedback_reports_feedback_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "feedback_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "feedback_attachments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    feedback_report_id = table.Column<Guid>(type: "uuid", nullable: false),
                    url = table.Column<string>(type: "text", nullable: false),
                    file_name = table.Column<string>(type: "text", nullable: true),
                    content_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_feedback_attachments", x => x.id);
                    table.ForeignKey(
                        name: "fk_feedback_attachments_feedback_reports_feedback_report_id",
                        column: x => x.feedback_report_id,
                        principalTable: "feedback_reports",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "feedback_comments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    feedback_report_id = table.Column<Guid>(type: "uuid", nullable: false),
                    author_id = table.Column<Guid>(type: "uuid", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    is_internal = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_feedback_comments", x => x.id);
                    table.ForeignKey(
                        name: "fk_feedback_comments_feedback_reports_feedback_report_id",
                        column: x => x.feedback_report_id,
                        principalTable: "feedback_reports",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "feedback_status_history",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    feedback_report_id = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("pk_feedback_status_history", x => x.id);
                    table.ForeignKey(
                        name: "fk_feedback_status_history_feedback_reports_feedback_report_id",
                        column: x => x.feedback_report_id,
                        principalTable: "feedback_reports",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_actor_user_id",
                table: "audit_logs",
                column: "actor_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_created_at",
                table: "audit_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_entity_type_entity_id",
                table: "audit_logs",
                columns: new[] { "entity_type", "entity_id" });

            migrationBuilder.CreateIndex(
                name: "ix_feedback_attachments_feedback_report_id",
                table: "feedback_attachments",
                column: "feedback_report_id");

            migrationBuilder.CreateIndex(
                name: "ix_feedback_categories_code",
                table: "feedback_categories",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_feedback_comments_feedback_report_id",
                table: "feedback_comments",
                column: "feedback_report_id");

            migrationBuilder.CreateIndex(
                name: "ix_feedback_reports_assigned_officer_id",
                table: "feedback_reports",
                column: "assigned_officer_id");

            migrationBuilder.CreateIndex(
                name: "ix_feedback_reports_category_id",
                table: "feedback_reports",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_feedback_reports_citizen_id",
                table: "feedback_reports",
                column: "citizen_id");

            migrationBuilder.CreateIndex(
                name: "ix_feedback_reports_code",
                table: "feedback_reports",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_feedback_reports_province_code_ward_code",
                table: "feedback_reports",
                columns: new[] { "province_code", "ward_code" });

            migrationBuilder.CreateIndex(
                name: "ix_feedback_reports_status",
                table: "feedback_reports",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_feedback_status_history_feedback_report_id",
                table: "feedback_status_history",
                column: "feedback_report_id");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_user_id_is_read",
                table: "notifications",
                columns: new[] { "user_id", "is_read" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "audit_logs");

            migrationBuilder.DropTable(
                name: "feedback_attachments");

            migrationBuilder.DropTable(
                name: "feedback_comments");

            migrationBuilder.DropTable(
                name: "feedback_status_history");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "feedback_reports");

            migrationBuilder.DropTable(
                name: "feedback_categories");
        }
    }
}
