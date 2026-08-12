using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CineSeat.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixSchemaIssues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_seat_locks_showtime_id",
                table: "seat_locks");

            migrationBuilder.DropColumn(
                name: "perm_id",
                table: "role_permissions");

            migrationBuilder.DropColumn(
                name: "tech_id",
                table: "hall_techs");

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_username",
                table: "users",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_seat_locks_showtime_id_seat_id",
                table: "seat_locks",
                columns: new[] { "showtime_id", "seat_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_users_email",
                table: "users");

            migrationBuilder.DropIndex(
                name: "ix_users_username",
                table: "users");

            migrationBuilder.DropIndex(
                name: "ix_seat_locks_showtime_id_seat_id",
                table: "seat_locks");

            migrationBuilder.AddColumn<long>(
                name: "perm_id",
                table: "role_permissions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "tech_id",
                table: "hall_techs",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "ix_seat_locks_showtime_id",
                table: "seat_locks",
                column: "showtime_id");
        }
    }
}
